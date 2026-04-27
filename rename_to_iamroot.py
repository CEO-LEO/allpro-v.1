"""
rename_to_iamroot.py
Replace all brand names from "All Pro" variants to "IAMROOT AI"
across the Next.js project in C:/all pro/all-promotion
"""
import os

BASE = r"C:\all pro\all-promotion"
SKIP_DIRS = {"node_modules", ".next", ".git", "__pycache__"}
EXTS = {".tsx", ".ts", ".js", ".jsx", ".json", ".css", ".html", ".md", ".txt", ".env", ".mjs"}

# Ordered replacements — more specific first
REPLACEMENTS = [
    ("All Pro Team",        "IAMROOT AI Team"),
    ("All Pro - ",          "IAMROOT AI - "),
    ("All Pro",             "IAMROOT AI"),
    ("all-promotions.com",  "iamroot-ai.com"),
    ("all-promotion",       "iamroot-ai"),
    ("allpro",              "iamrootai"),
    ("all_pro",             "iamroot_ai"),
    ("@allpro",             "@iamrootai"),
]

changed_files = []
skipped = []

for root, dirs, files in os.walk(BASE):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for fname in files:
        ext = os.path.splitext(fname)[1].lower()
        if ext not in EXTS:
            continue
        fpath = os.path.join(root, fname)
        try:
            with open(fpath, "r", encoding="utf-8") as f:
                original = f.read()
        except Exception as e:
            skipped.append(f"{fpath}: {e}")
            continue

        updated = original
        for old, new in REPLACEMENTS:
            updated = updated.replace(old, new)

        if updated != original:
            with open(fpath, "w", encoding="utf-8") as f:
                f.write(updated)
            rel = os.path.relpath(fpath, BASE)
            changed_files.append(rel)

print(f"\n=== Rename complete ===")
print(f"Changed: {len(changed_files)} files")
for f in sorted(changed_files):
    print(f"  v {f}")
if skipped:
    print(f"\nSkipped {len(skipped)} files:")
    for s in skipped:
        print(f"  x {s}")
