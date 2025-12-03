import json
from collections import defaultdict
from statistics import mean

class ServicesStatsAPI:

    def __init__(self, services_file="services.json"):
        self.services_file = services_file

    def load_services(self):
        with open(self.services_file, "r", encoding="utf-8") as f:
            return json.load(f)

    # ============================
    #   ESTADÍSTICAS
    # ============================

    def get_stats(self):
        services = self.load_services()

        # Convert dict → list
        services_list = list(services.values())

        # Agrupar por categoría
        categories = defaultdict(list)
        for s in services_list:
            categories[s["category"]].append(s)

        result = {
            "count_by_category": {
                cat: len(items) for cat, items in categories.items()
            },
            "avg_price_by_category": {
                cat: mean(item["price"] for item in items) for cat, items in categories.items()
            },
            "avg_duration_by_category": {
                cat: mean(item["duration_minutes"] for item in items) for cat, items in categories.items()
            }
        }

        return result