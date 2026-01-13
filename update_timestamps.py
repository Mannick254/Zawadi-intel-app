
import json
from datetime import datetime, timezone

def update_timestamps():
    with open("public/data/featured-card.json", "r") as f:
        data = json.load(f)

    now = datetime.now(timezone.utc)

    for item in data:
        date_modified_str = item.get("dateModified")
        if date_modified_str:
            # Correctly parse ISO 8601 format with timezone
            date_modified = datetime.fromisoformat(date_modified_str)
            
            # Ensure both datetimes are aware for comparison
            if date_modified.tzinfo is None:
                # If no timezone info, assume UTC as a fallback
                date_modified = date_modified.replace(tzinfo=timezone.utc)

            delta = now - date_modified

            seconds = delta.total_seconds()
            days = delta.days
            hours = int(seconds // 3600) % 24
            minutes = int(seconds // 60) % 60

            if days > 0:
                item["timestamp"] = f"Updated {days}d ago"
            elif hours > 0:
                item["timestamp"] = f"Updated {hours}h ago"
            elif minutes > 0:
                item["timestamp"] = f"Updated {minutes}m ago"
            else:
                item["timestamp"] = "Updated just now"

    with open("public/data/featured-card.json", "w") as f:
        json.dump(data, f, indent=4)

if __name__ == "__main__":
    update_timestamps()
