"""
CrowdEco Vector Flow Field Calculator:
Discretizes spatial venue into vector cells, calculating directional flow,
magnitude, divergence (compression vs dispersal), and bottleneck vortexes.
"""
import math
from typing import List, Dict, Any, Tuple
from app.analytics.pedestrian_tracker import PedestrianState

class VectorFlowField:
    def __init__(self, cols: int = 12, rows: int = 12, coord_max: float = 1000.0):
        self.cols = cols
        self.rows = rows
        self.coord_max = coord_max
        self.cell_w = coord_max / cols
        self.cell_h = coord_max / rows

    def compute_flow_field(self, pedestrians: List[PedestrianState]) -> List[Dict[str, Any]]:
        """
        Calculates average velocity vector for each spatial grid cell.
        Returns a list of vector objects with coordinates, magnitude, and angle.
        """
        # Accumulators
        cell_vx = [[0.0 for _ in range(self.cols)] for _ in range(self.rows)]
        cell_vy = [[0.0 for _ in range(self.cols)] for _ in range(self.rows)]
        cell_counts = [[0 for _ in range(self.cols)] for _ in range(self.rows)]

        for p in pedestrians:
            c = int(min(self.cols - 1, max(0, p.x / self.cell_w)))
            r = int(min(self.rows - 1, max(0, p.y / self.cell_h)))
            cell_vx[r][c] += p.vx
            cell_vy[r][c] += p.vy
            cell_counts[r][c] += 1

        vectors = []
        for r in range(self.rows):
            for c in range(self.cols):
                count = cell_counts[r][c]
                center_x = (c + 0.5) * self.cell_w
                center_y = (r + 0.5) * self.cell_h

                if count > 0:
                    avg_vx = cell_vx[r][c] / count
                    avg_vy = cell_vy[r][c] / count
                    magnitude = math.sqrt(avg_vx * avg_vx + avg_vy * avg_vy)
                    angle_rad = math.atan2(avg_vy, avg_vx)
                    angle_deg = (math.degrees(angle_rad) + 360.0) % 360.0

                    vectors.append({
                        "grid_x": c,
                        "grid_y": r,
                        "cx": round(center_x, 1),
                        "cy": round(center_y, 1),
                        "vx": round(avg_vx, 2),
                        "vy": round(avg_vy, 2),
                        "magnitude": round(magnitude, 2),
                        "angle_deg": round(angle_deg, 1),
                        "density_count": count
                    })

        return vectors

    def compute_divergence(self, pedestrians: List[PedestrianState]) -> Dict[str, float]:
        """
        Approximates macroscopic divergence (d(vx)/dx + d(vy)/dy).
        Negative values indicate crowd convergence / bottlenecking.
        """
        field = self.compute_flow_field(pedestrians)
        if not field:
            return {"mean_divergence": 0.0, "convergence_hotspots": 0}

        # Count cells with high density and low egress magnitude
        convergence_count = 0
        for cell in field:
            if cell["density_count"] >= 8 and cell["magnitude"] < 1.5:
                convergence_count += 1

        return {
            "convergence_hotspots": convergence_count
        }
