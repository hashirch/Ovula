# -*- coding: utf-8 -*-
"""DecisionTree.ipynb - Local Version with Model Saving"""

import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.ensemble import RandomForestClassifier
from sklearn.utils import resample
import numpy as np
import pandas as pd
import shutil

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(script_dir, '..', '..')

# Load data from local data/processed folder
data_path = os.path.join(project_root, 'data', 'processed', 'clean_data.csv')
data = pd.read_csv(data_path)

data.head()

# Drop columns if they exist
cols_to_drop = ['PCOS_from', 'City', 'relocated city', 'Unnamed: 0']
for col in cols_to_drop:
    if col in data.columns:
        del data[col]

data['PCOS_label'] = None
print(data.head())

data = data.set_index('PCOS_label')

data = data.reset_index()


def label(row):
    if row['PCOS'] == 1 or row['PCOS'] == 'Yes':
        return 1
    else:
        return 0


data['PCOS_label'] = data.apply(lambda row: label(row), axis=1)

print(data.head())
print(f"\nPCOS_label distribution: {data['PCOS_label'].value_counts().to_dict()}")

PCOS_check = dict(zip(data.PCOS_label.unique(), data.PCOS.unique()))
print(f"PCOS mapping: {PCOS_check}")

# Oversample the minority class
df_majority = data[data.PCOS_label==0]
df_minority = data[data.PCOS_label==1]

df_minority_upsampled = resample(df_minority, 
                                 replace=True,
                                 n_samples=len(df_majority),
                                 random_state=42)

data_upsampled = pd.concat([df_majority, df_minority_upsampled])

X = data_upsampled.drop(['PCOS_label', 'PCOS'], axis=1)
y = data_upsampled.PCOS_label

# Use stratified split to ensure both classes are in train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42, stratify=y)

print(f"Training set size: {len(X_train)}, Test set size: {len(X_test)}")
print(f"Training set class distribution: {y_train.value_counts().to_dict()}")
print(f"Test set class distribution: {y_test.value_counts().to_dict()}")

clf = RandomForestClassifier(n_estimators=150, max_depth=12, random_state=42, class_weight='balanced').fit(X_train, y_train)

tree_predicted = clf.predict(X_test)
confusion = confusion_matrix(y_test, tree_predicted)
print(confusion)

print('Accuracy: {:.2f}'.format(accuracy_score(y_test, tree_predicted)))
print('Precision: {:.2f}'.format(precision_score(y_test, tree_predicted, zero_division=0)))
print('Recall: {:.2f}'.format(recall_score(y_test, tree_predicted, zero_division=0)))
print('F1: {:.2f}'.format(f1_score(y_test, tree_predicted)))

print(classification_report(y_test, tree_predicted, zero_division=0))

print('Accuracy on training set: {:.2f}'.format(clf.score(X_train, y_train)))

print('Accuracy on test set: {:.2f}'.format(clf.score(X_test, y_test)))

feature_cols = ['Period Length', 'Cycle Length', 'Age', 'Overweight', 'loss weight gain / weight loss', 'irregular or missed periods', 'Difficulty in conceiving', 'Hair growth on Chin', 'Hair growth  on Cheeks', 'Hair growth Between breasts',
                'Hair growth  on Upper lips ', 'Hair growth in Arms', 'Hair growth on Inner thighs', 'Acne or skin tags', 'Hair thinning or hair loss ', 'Dark patches', 'always tired', 'more Mood Swings', 'exercise per week', 'eat outside per week', 'canned food often']

print("Feature columns:", feature_cols)

print("\n=== Sample Predictions ===")
pcos1 = clf.predict([[5, 6, 2, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 7, 0]])
print(f"Sample 1 prediction: {PCOS_check[pcos1[0]]}")

pcos2 = clf.predict([[5, 1, 2, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 3, 3, 0]])
print(f"Sample 2 prediction: {PCOS_check[pcos2[0]]}")

# Save the trained model
model_filename = os.path.join(project_root, 'models', 'saved', 'pcos_model.pkl')
pickle.dump(clf, open(model_filename, 'wb'))
print(f"Model saved to {model_filename}")

# Also copy to backend
backend_model_path = os.path.join(project_root, '..', 'backend', 'models', 'pcos_model.pkl')
os.makedirs(os.path.dirname(backend_model_path), exist_ok=True)
shutil.copy2(model_filename, backend_model_path)
print(f"Model copied to {backend_model_path}")

# Load and test the model
loaded_model = pickle.load(open(model_filename, 'rb'))

result = loaded_model.predict(
    [[5,	1,	2,	0,	0,	0,	0,	1,	0,	0,	1,	1,	0,	1,	0,	1,	0,	0,	3,	3,	0]])
print(f"Prediction result: {result}")
print(f"PCOS Status: {PCOS_check[result[0]]}")
