/** Public manufacturing bounds extracted from the existing configurator; no prices. */
export const SUR_MESURE_SPECS: Record<string, { dimensions: Array<{label: string; min: number; max: number}>; finishes: string[] }> = {
  "comptoir": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 800,
        "max": 2700
      },
      {
        "label": "Hauteur",
        "min": 700,
        "max": 1300
      },
      {
        "label": "Profondeur",
        "min": 400,
        "max": 900
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut"
    ]
  },
  "comptoirL": {
    "dimensions": [
      {
        "label": "Façade",
        "min": 1200,
        "max": 3000
      },
      {
        "label": "Retour",
        "min": 1100,
        "max": 2400
      },
      {
        "label": "Hauteur",
        "min": 900,
        "max": 1200
      },
      {
        "label": "Profondeur",
        "min": 400,
        "max": 800
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut"
    ]
  },
  "bar": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 1200,
        "max": 3000
      },
      {
        "label": "Hauteur",
        "min": 1050,
        "max": 1250
      },
      {
        "label": "Profondeur",
        "min": 500,
        "max": 900
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut",
      "acier",
      "acierP"
    ]
  },
  "pupitre": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 500,
        "max": 800
      },
      {
        "label": "Hauteur",
        "min": 1050,
        "max": 1250
      },
      {
        "label": "Profondeur",
        "min": 400,
        "max": 600
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut"
    ]
  },
  "table": {
    "dimensions": [
      {
        "label": "Longueur",
        "min": 800,
        "max": 2800
      },
      {
        "label": "Hauteur",
        "min": 400,
        "max": 1100
      },
      {
        "label": "Largeur",
        "min": 500,
        "max": 1200
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut",
      "acierP",
      "acier"
    ]
  },
  "mangeDebout": {
    "dimensions": [
      {
        "label": "Plateau",
        "min": 600,
        "max": 900
      },
      {
        "label": "Hauteur",
        "min": 1000,
        "max": 1200
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut",
      "acierP",
      "acier"
    ]
  },
  "stele": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 300,
        "max": 800
      },
      {
        "label": "Hauteur",
        "min": 400,
        "max": 1800
      },
      {
        "label": "Profondeur",
        "min": 300,
        "max": 800
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut",
      "pmmaC"
    ]
  },
  "podium": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 600,
        "max": 3000
      },
      {
        "label": "Hauteur",
        "min": 100,
        "max": 600
      },
      {
        "label": "Profondeur",
        "min": 500,
        "max": 2000
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut",
      "moquette"
    ]
  },
  "socleRond": {
    "dimensions": [
      {
        "label": "Diamètre",
        "min": 400,
        "max": 2000
      },
      {
        "label": "Hauteur",
        "min": 100,
        "max": 1100
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "chene",
      "brut",
      "miroir",
      "brosse",
      "moquette"
    ]
  },
  "cubes": {
    "dimensions": [
      {
        "label": "Grand cube",
        "min": 300,
        "max": 900
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut"
    ]
  },
  "gradin": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 800,
        "max": 3000
      },
      {
        "label": "Hauteur de marche",
        "min": 150,
        "max": 400
      },
      {
        "label": "Profondeur de marche",
        "min": 250,
        "max": 500
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut",
      "moquette"
    ]
  },
  "etagere": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 600,
        "max": 3000
      },
      {
        "label": "Hauteur",
        "min": 600,
        "max": 2400
      },
      {
        "label": "Profondeur",
        "min": 250,
        "max": 500
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut"
    ]
  },
  "urne": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 200,
        "max": 500
      },
      {
        "label": "Hauteur",
        "min": 250,
        "max": 600
      },
      {
        "label": "Profondeur",
        "min": 200,
        "max": 500
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut",
      "pmmaC",
      "pmmaD",
      "pmmaN"
    ]
  },
  "portant": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 800,
        "max": 2000
      },
      {
        "label": "Hauteur",
        "min": 1400,
        "max": 2000
      },
      {
        "label": "Profondeur des pieds",
        "min": 400,
        "max": 600
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut",
      "acierP",
      "acier"
    ]
  },
  "totem": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 500,
        "max": 1200
      },
      {
        "label": "Hauteur",
        "min": 1600,
        "max": 2500
      },
      {
        "label": "Épaisseur",
        "min": 120,
        "max": 400
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut",
      "visuel"
    ]
  },
  "mur": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 1000,
        "max": 6000
      },
      {
        "label": "Hauteur",
        "min": 2000,
        "max": 3000
      }
    ],
    "finishes": [
      "laque",
      "visuel"
    ]
  },
  "cacheRegie": {
    "dimensions": [
      {
        "label": "Façade",
        "min": 1500,
        "max": 4500
      },
      {
        "label": "Retours",
        "min": 500,
        "max": 1500
      },
      {
        "label": "Hauteur",
        "min": 1000,
        "max": 1500
      }
    ],
    "finishes": [
      "laque",
      "visuel"
    ]
  },
  "arche": {
    "dimensions": [
      {
        "label": "Ouverture",
        "min": 1200,
        "max": 4000
      },
      {
        "label": "Hauteur de passage",
        "min": 2000,
        "max": 3000
      },
      {
        "label": "Largeur des montants",
        "min": 250,
        "max": 600
      },
      {
        "label": "Profondeur",
        "min": 250,
        "max": 600
      },
      {
        "label": "Hauteur du linteau",
        "min": 250,
        "max": 800
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "brut"
    ]
  },
  "lettres": {
    "dimensions": [
      {
        "label": "Hauteur des lettres",
        "min": 300,
        "max": 1500
      },
      {
        "label": "Profondeur",
        "min": 80,
        "max": 300
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "chene",
      "cp",
      "noir",
      "miroir",
      "brosse",
      "brut"
    ]
  },
  "cadre": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 800,
        "max": 2000
      },
      {
        "label": "Hauteur",
        "min": 600,
        "max": 1600
      },
      {
        "label": "Largeur du cadre",
        "min": 80,
        "max": 300
      }
    ],
    "finishes": [
      "laque",
      "visuel"
    ]
  },
  "claustra": {
    "dimensions": [
      {
        "label": "Largeur",
        "min": 600,
        "max": 3000
      },
      {
        "label": "Hauteur",
        "min": 1200,
        "max": 2600
      }
    ],
    "finishes": [
      "tasV",
      "tasL"
    ]
  },
  "banc": {
    "dimensions": [
      {
        "label": "Longueur",
        "min": 800,
        "max": 3000
      },
      {
        "label": "Hauteur d'assise",
        "min": 380,
        "max": 500
      },
      {
        "label": "Profondeur",
        "min": 350,
        "max": 600
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut",
      "tissu"
    ]
  },
  "pouf": {
    "dimensions": [
      {
        "label": "Côté ou diamètre",
        "min": 350,
        "max": 600
      },
      {
        "label": "Hauteur",
        "min": 350,
        "max": 500
      }
    ],
    "finishes": [
      "tissu"
    ]
  },
  "jardiniere": {
    "dimensions": [
      {
        "label": "Longueur",
        "min": 400,
        "max": 2000
      },
      {
        "label": "Hauteur",
        "min": 300,
        "max": 1000
      },
      {
        "label": "Profondeur",
        "min": 300,
        "max": 600
      }
    ],
    "finishes": [
      "laque",
      "laqueB",
      "mela",
      "chene",
      "cp",
      "osb",
      "noir",
      "miroir",
      "brosse",
      "brut"
    ]
  }
};
