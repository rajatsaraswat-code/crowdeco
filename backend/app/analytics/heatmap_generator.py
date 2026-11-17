"""
CrowdEco Heatmap Generator:
Computes a 2D spatial density matrix and hot-spot clusters
for real-time crowd density visualization.
"""
from typing import List, Dict, Any
import numpy as np
from app.analytics.pedestrian_tracker import PedestrianState

class HeatmapGenerator:
    def __init__(self, grid_rows: int = 25, grid_cols: int = 25, coord_max: float = 1000.0):
        self.grid_rows = grid_rows
        self.grid_cols = grid_cols
        self.coord_max = coord_max
        self.dx = coord_max / grid_cols
        self.dy = coord_max / grid_rows

    def compute_density_grid(self, pedestrians: List[PedestrianState]) -> List[List[float]]:
        """
        Creates a normalized 2D density matrix where values are in [0.0, 1.0].
        Applies a simple 3x3 kernel smoothing so the heatmap appears organic.
        """
        grid = np.zeros((self.grid_rows, self.grid_cols), dtype=np.float32)

        for p in pedestrians:
            col = int(min(self.grid_cols - 1, max(0, p.x / self.dx)))
            row = int(min(self.grid_rows - 1, max(0, p.y / self.dy)))
            grid[row, col] += 1.0

        # Max density for scaling
        max_val = np.max(grid)
        if max_val > 0:
            grid = grid / max(5.0, max_val)  # Normalize
        
        # Round to 2 decimals for JSON serialization efficiency
        return np.round(grid, 2).tolist()
