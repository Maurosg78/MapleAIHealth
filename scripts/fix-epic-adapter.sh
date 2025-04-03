#!/bin/bash
sed -i '' -E 's/id: ([a-zA-Z0-9_\.]+)\.id([,}])/id: \1.id || crypto.randomUUID()\2/g' "src/services/emr/implementations/EPICAdapter.ts"
sed -i '' -E 's/(mapStatus\(status: string\)): string/\1: "active" | "inactive" | "pending" | "cancelled" | "completed"/g' "src/services/emr/implementations/EPICAdapter.ts"
sed -i '' -E 's/return "([a-z]+)";/return "\1" as const;/g' "src/services/emr/implementations/EPICAdapter.ts"
