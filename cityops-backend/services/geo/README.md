# Geo Engine

## Function

```javascript
resolveWardAndDepartment(
  lat,
  lng,
  category,
  duplicateCount
)
```

## Example

```javascript
const result =
resolveWardAndDepartment(
  12.9716,
  77.5946,
  "Pothole",
  2
);
```

## Returns

```json
{
  "ward": "Shivajinagar",
  "zone": "East Zone",
  "department": "BBMP Roads Wing",
  "priority": 5
}
```