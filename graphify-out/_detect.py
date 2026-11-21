import json
from graphify.detect import detect
from pathlib import Path
from graphify.paths import out_path
from graphify.watch import _read_build_excludes, _read_build_gitignore

INPUT_PATH = "."
result = detect(Path(INPUT_PATH), extra_excludes=_read_build_excludes(out_path()), gitignore=_read_build_gitignore(out_path()))
Path("graphify-out/.graphify_detect.json").write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
print(f'Detected {result["total_files"]} files')
print(json.dumps({k: (v if not isinstance(v, list) else len(v)) for k, v in result.items() if k not in ("files",)}, ensure_ascii=False, indent=2))
print("BY TYPE:")
for k, v in result.get("files", {}).items():
    print(f"  {k}: {len(v)}")
