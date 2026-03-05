# -*- coding: utf-8 -*-
"""NaiveBayesPrediction.ipynb - Local Version"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(script_dir, '..', '..')

# Load data from local data/processed folder
data_path = os.path.join(project_root, 'data', 'processed', 'clean_data.csv')
data = pd.read_csv(data_path)

print(data.head())

# Drop unnecessary columns if they exist
cols_to_drop = ['Unnamed: 0', 'City', 'PCOS_from']
for col in cols_to_drop:
    if col in data.columns:
        data.drop(data.columns[[data.columns.get_loc(col)]], inplace=True, axis=1)

# Reorder columns to have PCOS at the end
cols = list(data.columns.values)
if 'PCOS' in cols:
    cols.pop(cols.index('PCOS'))
    data = data[cols+['PCOS']]

data['PCOS'] = data['PCOS'].map({1: 1, 0: 0})

print(data.head())

x = data.drop('PCOS', axis = 1)
y = data['PCOS']

x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.25, random_state=42)
print(f"Training set size: {len(x_train)}, Test set size: {len(x_test)}")

model = GaussianNB()
model.fit(x_train, y_train)

y_pred = model.predict(x_test)

accuracy = accuracy_score(y_test, y_pred) * 100
print(f"Accuracy: {accuracy:.2f}%")

from sklearn.metrics import confusion_matrix

results = confusion_matrix(y_test, y_pred) 
     
print('Confusion Matrix :')
print(results)