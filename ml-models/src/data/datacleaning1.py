# -*- coding: utf-8 -*-
"""DataCleaning.ipynb - Local Version"""

import pandas as pd
import numpy as np
import os

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(script_dir, '..', '..')
dataset_dir = os.path.join(project_root, 'data', 'raw')

# Load data from local data/raw folder
data_path = os.path.join(dataset_dir, 'results.xlsx')
data = pd.read_excel(data_path)

print(data.head())

data.drop('Timestamp', inplace=True, axis=1)
data.drop('PCOS tested', inplace=True, axis=1)
data.drop('When do you experience mood swings?', inplace=True, axis=1)

print(data.head())

data["City"] = data["City"].str.lower()

print(data.head())

data = data.rename(columns={'PCOS from age of': 'PCOS_from'})

data['PCOS_from'] = data.PCOS_from.str.extract(r'(\d+)')

print(data.head())

output_path = os.path.join(project_root, 'data', 'interim', 'allData.csv')
data.to_csv(output_path, index=False)
print(f"Saved allData.csv to {output_path}")

# Filter for PCOS positive cases
PCOS_True = data[data['PCOS'] == 'Yes'].copy()
PCOS_True.dropna(subset=["PCOS_from"], inplace=True)

print(PCOS_True.head())

pcos_output_path = os.path.join(project_root, 'data', 'interim', 'OnlyPCOS.csv')
PCOS_True.to_csv(pcos_output_path, index=False)
print(f"Saved OnlyPCOS.csv to {pcos_output_path}")
