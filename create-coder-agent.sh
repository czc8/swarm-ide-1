#!/bin/bash

# Create Coder Agent Script
# Usage: ./create-coder-agent.sh <workspace_id> [creator_id] [guidance]

BACKEND_URL="http://localhost:3017"
WORKSPACE_ID="${1:-}"
CREATOR_ID="${2:-}"
GUIDANCE="${3:-You are a professional coder agent. Your role is to write clean, well-documented code and provide technical solutions.}"

if [ -z "$WORKSPACE_ID" ]; then
  echo "Error: workspace_id is required"
  echo "Usage: $0 <workspace_id> [creator_id] [guidance]"
  exit 1
fi

if [ -z "$CREATOR_ID" ]; then
  CREATOR_ID="$WORKSPACE_ID"
  echo "Note: creator_id not provided, using workspace_id as creator_id"
fi

echo "Creating coder agent..."
echo "Workspace ID: $WORKSPACE_ID"
echo "Creator ID: $CREATOR_ID"
echo "Guidance: $GUIDANCE"
echo ""

curl -X POST "$BACKEND_URL/api/agents" \
  -H "Content-Type: application/json" \
  -d "{
    \"workspaceId\": \"$WORKSPACE_ID\",
    \"creatorId\": \"$CREATOR_ID\",
    \"role\": \"coder\",
    \"guidance\": \"$GUIDANCE\"
  }"

echo ""
echo "Done!"
