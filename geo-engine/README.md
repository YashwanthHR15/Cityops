# Geo & Priority Engine

## Features
- Ward Resolution
- Department Routing
- Priority Calculation
- Duplicate Complaint Detection
- Geo-based Duplicate Clustering (100m radius)
- Dynamic Escalation (NORMAL/HIGH/URGENT)

## Main Function

resolveWardAndDepartment(lat, lng, category, duplicateCount)

## Smart Features

1. Duplicate Detection
   - Same category
   - Within 100m radius

2. Priority Formula
   - Severity Score
   - Duplicate Count

3. Escalation Levels
   - NORMAL
   - HIGH
   - URGENT