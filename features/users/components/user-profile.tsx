"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { validation } from "@/config/validation";
import { digitsOnly, toPersianDigits } from "@/lib/format/number";
import type { User } from "@/types/domain";
import { toast } from "sonner";
import { usersApi } from "../client-api";
import { updateUserSchema, type UpdateUserInput } from "../schemas";
import { useUniqueCheck } from "../use-unique-check";
import { EditableField } from "./editable-field";
import { RoleBadge } from "./role-badge";
import { UniqueStatus } from "./unique-status";

/**
 * The profile card with field-level editing.
 *
 * Each pencil edits exactly one field. Every change lands in a draft; the save
 * bar appears only once the draft differs from what the server sent. Saving
 * sends the whole `UserInput` because the backend replaces the document rather
 * than patching individual keys.
 */

type Draft = {
  name: string;
  lastName: string;
  nationalId: string;
  primaryPhone: string;
  secondaryPhone: string;
  residentialAddress: string;
  occupation: string;
  workplace: string;
  guarantorContact: string;
};

type FieldKey = keyof Draft;

function draftFromUser(user: User): Draft {
  return {
    name: user.name ?? "",
    lastName: user.lastName ?? "",
    nationalId: user.nationalId ?? "",
    primaryPhone: user.phoneNumbers?.primary ?? "",
    secondaryPhone: user.phoneNumbers?.secondary ?? "",
    residentialAddress: user.residentialAddress ?? "",
    occupation: user.employmentDetails?.occupation ?? "",
    workplace: user.employmentDetails?.workplace ?? "",
    guarantorContact: user.guarantorContact ?? "",
  };
}

const FIELD_BY_PATH: Record<string, FieldKey> = {
  name: "name",
  lastName: "lastName",
  nationalId: "nationalId",
  "phoneNumbers.primary": "primaryPhone",
  "phoneNumbers.secondary": "secondaryPhone",
  residentialAddress: "residentialAddress",
  "employmentDetails.occupation": "occupation",
  "employmentDetails.workplace": "workplace",
  guarantorContact: "guarantorContact",
};

const LTR_FIELDS: readonly FieldKey[] = [
  "nationalId",
  "primaryPhone",
  "secondaryPhone",
  "guarantorContact",
];

export function UserProfile({ user, canUpdate }: { user: User; canUpdate: boolean }) {
  const [initial, setInitial] = useState<Draft>(() => draftFromUser(user));
  const [draft, setDraft] = useState<Draft>(initial);
  const [editing, setEditing] = useState<Set<FieldKey>>(new Set());
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const unique = useUniqueCheck(user._id);
  const checkTimers = useRef<{
    nationalId?: ReturnType<typeof setTimeout>;
    primaryPhone?: ReturnType<typeof setTimeout>;
  }>({});

  useEffect(
    () => () => {
      if (checkTimers.current.nationalId) clearTimeout(checkTimers.current.nationalId);
      if (checkTimers.current.primaryPhone)
        clearTimeout(checkTimers.current.primaryPhone);
    },
    [],
  );

  const dirty = (Object.keys(initial) as FieldKey[]).some(
    (key) => draft[key] !== initial[key],
  );

  function setField(key: FieldKey, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));

    if (key === "nationalId") unique.reset("nationalId");
    if (key === "primaryPhone") unique.reset("phone");
  }

  function toggle(key: FieldKey) {
    setEditing((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function reset() {
    setDraft(initial);
    setEditing(new Set());
    setErrors({});
    setFormError(null);
    unique.reset("nationalId");
    unique.reset("phone");
  }

  async function checkUniqueField(
    key: "nationalId" | "primaryPhone",
    valueOverride?: string,
  ) {
    const field = key === "nationalId" ? "nationalId" : "phone";
    const value = valueOverride ?? digitsOnly(draft[key]);
    const original = digitsOnly(initial[key]);

    // An unchanged value is already the user's own, so it cannot clash.
    if (value === original) {
      unique.reset(field);
      return;
    }

    const validLength =
      field === "nationalId"
        ? value.length === validation.nationalId.length
        : value.length >= validation.phoneNumber.minLength;

    if (!validLength) {
      unique.reset(field);
      // Give the same visible feedback as the create form instead of silently
      // doing nothing when the national ID is not 10 digits.
      if (field === "nationalId" && value.length > 0) {
        setErrors((current) => ({
          ...current,
          nationalId: `کد ملی باید ${toPersianDigits(validation.nationalId.length)} رقم باشد.`,
        }));
      }
      return;
    }

    // The result is shown by `UniqueStatus` only — setting a field error as
    // well drew the same sentence twice under the input.
    await unique.check(field, value);
  }

  /**
   * Checks as soon as the value is complete rather than on blur; the debounce
   * avoids a request per keystroke while the user is still typing.
   */
  function scheduleUniqueCheck(key: "nationalId" | "primaryPhone", value: string) {
    if (checkTimers.current[key]) clearTimeout(checkTimers.current[key]);

    const complete =
      key === "nationalId"
        ? value.length === validation.nationalId.length
        : value.length >= validation.phoneNumber.minLength;

    if (!complete) return;

    checkTimers.current[key] = setTimeout(() => {
      void checkUniqueField(key, value);
    }, 400);
  }

  async function save() {
    setFormError(null);

    if (
      unique.state.nationalId.status === "taken" &&
      unique.state.nationalId.value === digitsOnly(draft.nationalId)
    ) {
      setFormError("کد ملی واردشده قبلاً برای کاربر دیگری ثبت شده است.");
      return;
    }

    if (
      unique.state.phone.status === "taken" &&
      unique.state.phone.value === digitsOnly(draft.primaryPhone)
    ) {
      setFormError("شماره تماس واردشده قبلاً برای کاربر دیگری ثبت شده است.");
      return;
    }

    const payload = {
      name: draft.name,
      lastName: draft.lastName,
      nationalId: digitsOnly(draft.nationalId),
      phoneNumbers: {
        primary: digitsOnly(draft.primaryPhone),
        secondary: draft.secondaryPhone.trim() ? digitsOnly(draft.secondaryPhone) : null,
      },
      residentialAddress: draft.residentialAddress.trim() || undefined,
      employmentDetails: {
        occupation: draft.occupation.trim() || undefined,
        workplace: draft.workplace.trim() || undefined,
      },
      guarantorContact: draft.guarantorContact.trim() || undefined,
      identityDocuments: user.identityDocuments
        ? {
            ...(user.identityDocuments.nationalCardImage
              ? { nationalCardImage: user.identityDocuments.nationalCardImage }
              : {}),
            otherDocuments: user.identityDocuments.otherDocuments ?? [],
          }
        : undefined,
    };

    const parsed = updateUserSchema.safeParse(payload);

    if (!parsed.success) {
      const nextErrors: Partial<Record<FieldKey, string>> = {};

      for (const issue of parsed.error.issues) {
        const key = FIELD_BY_PATH[issue.path.join(".")];
        if (key) nextErrors[key] = issue.message;
      }

      setErrors(nextErrors);
      return;
    }

    setSaving(true);

    const result = await usersApi.update(user._id, parsed.data as UpdateUserInput);

    setSaving(false);

    if (!result.ok) {
      if (result.fieldErrors.length > 0) {
        const nextErrors: Partial<Record<FieldKey, string>> = {};

        for (const { field, message } of result.fieldErrors) {
          const key = FIELD_BY_PATH[field];
          if (key) nextErrors[key] = message;
        }

        setErrors(nextErrors);

        // The server is the authority: clear a now-wrong green hint so the
        // field error is not contradicted by "available".
        if (result.fieldErrors.some((error) => error.field === "nationalId")) {
          unique.reset("nationalId");
        }

        if (result.fieldErrors.some((error) => error.field === "phoneNumbers.primary")) {
          unique.reset("phone");
        }
      } else {
        setFormError(result.message);
      }

      return;
    }

    const saved: Draft = {
      name: parsed.data.name,
      lastName: parsed.data.lastName,
      nationalId: parsed.data.nationalId,
      primaryPhone: parsed.data.phoneNumbers.primary,
      secondaryPhone: parsed.data.phoneNumbers.secondary ?? "",
      residentialAddress: parsed.data.residentialAddress ?? "",
      occupation: parsed.data.employmentDetails?.occupation ?? "",
      workplace: parsed.data.employmentDetails?.workplace ?? "",
      guarantorContact: parsed.data.guarantorContact ?? "",
    };

    setInitial(saved);
    setDraft(saved);
    setEditing(new Set());
    setErrors({});
    unique.reset("nationalId");
    unique.reset("phone");
    toast.success("تغییرات کاربر ذخیره شد.");
  }

  const textInput = (key: FieldKey, label: string) => {
    const uniqueState =
      key === "nationalId"
        ? unique.state.nationalId
        : key === "primaryPhone"
          ? unique.state.phone
          : null;

    return (
      <>
        <Input
          id={key}
          value={draft[key]}
          onChange={(event) => {
            const next = LTR_FIELDS.includes(key)
              ? digitsOnly(event.target.value)
              : event.target.value;
            setField(key, next);

            if (key === "nationalId" || key === "primaryPhone") {
              scheduleUniqueCheck(key, next);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();

              if (key === "nationalId" || key === "primaryPhone") {
                void checkUniqueField(key);
              }

              toggle(key);
            }
          }}
          invalid={Boolean(errors[key]) || uniqueState?.status === "taken"}
          dir={LTR_FIELDS.includes(key) ? "ltr" : undefined}
          inputMode={LTR_FIELDS.includes(key) ? "numeric" : undefined}
          autoFocus
          aria-label={label}
          className="h-10 text-sm"
        />
        {uniqueState ? <UniqueStatus state={uniqueState} /> : null}
      </>
    );
  };

  const display = (key: FieldKey) =>
    draft[key] ? (
      <span dir={LTR_FIELDS.includes(key) ? "ltr" : undefined}>
        {LTR_FIELDS.includes(key) ? toPersianDigits(draft[key]) : draft[key]}
      </span>
    ) : (
      "—"
    );

  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="text-sm font-bold text-ink">اطلاعات کاربر</h2>
          <p className="mt-1 text-xs text-ink-muted">
            برای ویرایش هر مقدار، روی آیکن مداد کنار آن بزنید.
          </p>
        </div>
        <RoleBadge role={user.role} />
      </header>

      {formError ? (
        <Alert tone="error" className="mt-4">
          {formError}
        </Alert>
      ) : null}

      <div className="mt-2 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
        <EditableField
          id="name"
          label="نام"
          value={display("name")}
          editing={editing.has("name")}
          error={errors.name}
          canEdit={canUpdate}
          onToggle={() => toggle("name")}
        >
          {textInput("name", "نام")}
        </EditableField>

        <EditableField
          id="lastName"
          label="نام خانوادگی"
          value={display("lastName")}
          editing={editing.has("lastName")}
          error={errors.lastName}
          canEdit={canUpdate}
          onToggle={() => toggle("lastName")}
        >
          {textInput("lastName", "نام خانوادگی")}
        </EditableField>

        <EditableField
          id="nationalId"
          label="کد ملی"
          value={display("nationalId")}
          editing={editing.has("nationalId")}
          error={errors.nationalId}
          canEdit={canUpdate}
          onToggle={() => toggle("nationalId")}
        >
          {textInput("nationalId", "کد ملی")}
        </EditableField>

        <EditableField
          id="primaryPhone"
          label="شماره تماس اصلی"
          value={display("primaryPhone")}
          editing={editing.has("primaryPhone")}
          error={errors.primaryPhone}
          canEdit={canUpdate}
          onToggle={() => toggle("primaryPhone")}
        >
          {textInput("primaryPhone", "شماره تماس اصلی")}
        </EditableField>

        <EditableField
          id="secondaryPhone"
          label="شماره تماس دوم"
          value={display("secondaryPhone")}
          editing={editing.has("secondaryPhone")}
          error={errors.secondaryPhone}
          canEdit={canUpdate}
          onToggle={() => toggle("secondaryPhone")}
        >
          {textInput("secondaryPhone", "شماره تماس دوم")}
        </EditableField>

        <EditableField
          id="guarantorContact"
          label="شماره تماس ضامن"
          value={display("guarantorContact")}
          editing={editing.has("guarantorContact")}
          error={errors.guarantorContact}
          canEdit={canUpdate}
          onToggle={() => toggle("guarantorContact")}
        >
          {textInput("guarantorContact", "شماره تماس ضامن")}
        </EditableField>

        <EditableField
          id="occupation"
          label="شغل"
          value={display("occupation")}
          editing={editing.has("occupation")}
          error={errors.occupation}
          canEdit={canUpdate}
          onToggle={() => toggle("occupation")}
        >
          {textInput("occupation", "شغل")}
        </EditableField>

        <EditableField
          id="workplace"
          label="محل کار"
          value={display("workplace")}
          editing={editing.has("workplace")}
          error={errors.workplace}
          canEdit={canUpdate}
          onToggle={() => toggle("workplace")}
        >
          {textInput("workplace", "محل کار")}
        </EditableField>

        <EditableField
          id="residentialAddress"
          label="آدرس محل سکونت"
          value={display("residentialAddress")}
          editing={editing.has("residentialAddress")}
          error={errors.residentialAddress}
          canEdit={canUpdate}
          onToggle={() => toggle("residentialAddress")}
          className="sm:col-span-2"
        >
          <Textarea
            id="residentialAddress"
            value={draft.residentialAddress}
            onChange={(event) => setField("residentialAddress", event.target.value)}
            invalid={Boolean(errors.residentialAddress)}
            autoFocus
            aria-label="آدرس محل سکونت"
            className="min-h-20 text-sm"
          />
        </EditableField>
      </div>

      {dirty ? (
        <div className="sticky bottom-4 z-10 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-field border border-brand-200 bg-brand-tint px-4 py-3 shadow-card">
          <p className="text-xs font-medium text-brand-800">تغییرات ذخیره‌نشده دارید.</p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={reset}
              disabled={saving}
            >
              انصراف
            </Button>
            <Button type="button" size="sm" isLoading={saving} onClick={save}>
              ذخیره تغییرات
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
