"use client";

import { UserSearchPicker } from "@/features/users/components/user-search-picker";
import type { User } from "@/types/domain";

type CustomerPickerProps = {
  selected: User | null;
  onSelect: (user: User | null) => void;
  error?: string;
};

/** The invoice wizard's customer step; the lookup itself is shared. */
export function CustomerPicker({ selected, onSelect, error }: CustomerPickerProps) {
  return (
    <UserSearchPicker
      selected={selected}
      onSelect={onSelect}
      error={error}
      ariaLabel="جستجوی مشتری"
    />
  );
}
