const { Noise } = require('noisejs');

const textures = {
  lacs: [
    { image: "water2", weight: 0.4 },
    { image: "water2", weight: 0.3 },
    { image: "water2", weight: 0.2 },
    { image: "water2", weight: 0.1 },
  ],
  plaines: [
    { image: "grass1", weight: 0.4 },
    { image: "grass2", weight: 0.3 },
    { image: "grass3", weight: 0.2 },
    { image: "grass4", weight: 0.1 },
  ],
  colline: [
    { image: "stone1", weight: 0.4 },
    { image: "stone2", weight: 0.4 },
    { image: "stone3", weight: 0.1 },
    { image: "stone4", weight: 0.1 },
  ],
};

/**
 * Génère une grille de terrain avec des biomes basés sur le bruit de Perlin
 * et des textures aléatoires par biome
 * @param {number} gridSize - Taille de la grille (ex. 20 pour 20x20)
 * @param {number} seed - La seed pour la génération (pour un terrain reproductible)
 * @returns {Array} Une grille générée avec des biomes, altitudes et textures
 */
const generateInitialGrid = (gridSize, seed) => {
  const noise = new Noise(seed); // Crée une nouvelle instance de Noise avec la seed
  const scale = 0.1; // Échelle du bruit pour les biomes (ajustée pour des zones plus larges)
  const textureScale = 0.2; // Échelle du bruit pour la variation des textures

  return Array.from({ length: gridSize }, (_, rowIndex) =>
    Array.from({ length: gridSize }, (_, colIndex) => {
      // Générer un bruit pour les biomes
      const noiseValue = noise.perlin2(rowIndex * scale, colIndex * scale);
      const normalizedValue = (noiseValue + 1) / 2; // Normaliser entre 0 et 1

      // Affecter un biome en fonction de la valeur normalisée
      let type;
      let altitude;

      if (normalizedValue < 0.35) {
        type = 'lacs';
        altitude = -25;
      }
      else if (normalizedValue < 0.65) {
        type = 'plaines';
        altitude = 5;
      } else if (normalizedValue < 0.8) {
        type = 'colline';
        altitude = 25;
      } else {
        type = 'colline';
        altitude = 50;
      }

      // Générer un autre bruit pour choisir une texture spécifique
      const textureNoiseValue = noise.perlin2(rowIndex * textureScale, colIndex * textureScale);
      const textureSelection = Math.floor(((textureNoiseValue + 1) / 2) * 100); // Normaliser entre 0 et 100

      // Sélectionner la texture en fonction des poids
      const texturesWithWeights = textures[type];
      let cumulativeWeight = 0;
      let selectedTexture;

      for (const { image, weight } of texturesWithWeights) {
        cumulativeWeight += weight * 100; // Multiplier par 100 pour ajuster les poids
        if (textureSelection < cumulativeWeight) {
          selectedTexture = image;
          break;
        }
      }

      return {
        type,
        altitude,
        texture: selectedTexture,
        batiment: null,
      };
    })
  );
};

const disjoncter = (grid) => {
  
}

module.exports = {
  generateInitialGrid,
};