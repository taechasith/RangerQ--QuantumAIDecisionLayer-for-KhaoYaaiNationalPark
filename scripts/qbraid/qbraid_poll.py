#!/usr/bin/env python
"""Poll or inspect a local qBraid worker result for RangerQ."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Inspect a RangerQ qBraid worker result JSON.")
    parser.add_argument("--result", default=".rangerq/latest_qbraid_result.json", help="Path to qBraid result JSON.")
    parser.add_argument("--job-id", default="", help="Optional qBraid job id for future remote polling.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    result_path = Path(args.result)

    if args.job_id and not result_path.exists():
      print(json.dumps({
          "ok": False,
          "status": "REMOTE_POLL_NOT_CONFIGURED",
          "job_id": args.job_id,
          "message": "Remote qBraid polling requires account-specific SDK/API configuration.",
      }, indent=2))
      return

    if not result_path.exists():
        raise SystemExit(f"Result file not found: {result_path}")

    with result_path.open("r", encoding="utf-8") as handle:
        print(json.dumps(json.load(handle), indent=2))


if __name__ == "__main__":
    main()

