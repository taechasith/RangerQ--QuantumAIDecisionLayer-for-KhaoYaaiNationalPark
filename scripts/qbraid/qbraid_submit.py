#!/usr/bin/env python
"""Submit a RangerQ QUBO payload through a local qBraid-capable worker.

The script intentionally keeps imports light until execution so `--help` works
without qBraid, qiskit, numpy, or scipy installed.
"""

from __future__ import annotations

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Submit or dry-run a RangerQ QUBO payload for qBraid execution.")
    parser.add_argument("--input", required=True, help="Path to QUBO payload JSON.")
    parser.add_argument("--output", required=True, help="Path to result JSON.")
    parser.add_argument("--device", default=os.environ.get("QBRAID_DEVICE_ID", "qbraid_qir_simulator"), help="qBraid device or simulator id.")
    parser.add_argument("--dry-run", action="store_true", help="Validate payload and write a deterministic local result without qBraid.")
    parser.add_argument("--post-back-url", default="", help="Optional app endpoint to POST result JSON after completion.")
    return parser.parse_args()


def load_payload(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)
    if payload.get("problem_type") != "patrol_zone_selection":
        raise ValueError("Expected problem_type=patrol_zone_selection")
    if not payload.get("variables") or not isinstance(payload["variables"], list):
        raise ValueError("QUBO payload must contain variables[]")
    return payload


def deterministic_local_solution(payload: dict[str, Any]) -> dict[str, Any]:
    linear = payload.get("linear", {})
    variables = payload.get("variables", [])
    max_zones = int(payload.get("constraints", {}).get("max_zones", 5))
    ranked = sorted(variables, key=lambda name: float(linear.get(name, 0)))
    selected = ranked[:max_zones]
    return {
        "selected_variables": selected,
        "objective_estimate": sum(float(linear.get(name, 0)) for name in selected),
        "solver": "deterministic_local_fallback",
    }


def submit_with_qbraid(payload: dict[str, Any], device: str) -> dict[str, Any]:
    try:
        import qbraid  # type: ignore
    except ImportError as exc:
        raise RuntimeError("qBraid SDK is not installed. Run: pip install qbraid qiskit numpy scipy requests") from exc

    # qBraid execution APIs vary by account/device configuration. Keep the
    # payload and environment explicit so this worker can be adapted without
    # changing the Vercel app or RangerQ data model.
    return {
        "selected_variables": deterministic_local_solution(payload)["selected_variables"],
        "objective_estimate": deterministic_local_solution(payload)["objective_estimate"],
        "solver": "qbraid_worker_scaffold",
        "device": device,
        "qbraid_module": getattr(qbraid, "__name__", "qbraid"),
        "note": "qBraid SDK import succeeded. Configure account-specific circuit/QUBO submission here.",
    }


def maybe_post_back(url: str, result: dict[str, Any]) -> None:
    if not url:
        return
    try:
        import requests  # type: ignore
    except ImportError as exc:
        raise RuntimeError("requests is required for --post-back-url. Run: pip install requests") from exc

    response = requests.post(url, json=result, timeout=30)
    response.raise_for_status()


def main() -> None:
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)
    payload = load_payload(input_path)

    if args.dry_run:
        solution = deterministic_local_solution(payload)
    else:
        solution = submit_with_qbraid(payload, args.device)

    result = {
        "ok": True,
        "status": "COMPLETED_LOCAL_WORKER",
        "device": args.device,
        "input": str(input_path),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "payload_metadata": payload.get("metadata", {}),
        "solution": solution,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as handle:
        json.dump(result, handle, indent=2)

    maybe_post_back(args.post_back_url, result)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()

