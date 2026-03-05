
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, accuracy_score, precision_score, recall_score, f1_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import pandas as pd
import numpy as np
import os

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(script_dir, '..', '..')

# Load data from local data/processed folder
data_path = os.path.join(project_root, 'data', 'processed', 'clean_data.csv')
data = pd.read_csv(data_path)

print(data.head())

# Drop columns if they exist
cols_to_drop = ['PCOS_from', 'City', 'relocated city', 'Unnamed: 0']
for col in cols_to_drop:
    if col in data.columns:
        del data[col]

print(data.head())

data['PCOS_label'] = None
data = data.set_index('PCOS_label')
data = data.reset_index()
data.head()


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

x = data.drop(['PCOS_label', 'PCOS'], axis=1)
y = data.PCOS_label

# Use stratified split to ensure both classes are in train and test sets
xtrain, xtest, ytrain, ytest = train_test_split(x, y, test_size=0.25, random_state=42, stratify=y)
print(f"Training set size: {len(xtrain)}, Test set size: {len(xtest)}")
print(f"Training set class distribution: {ytrain.value_counts().to_dict()}")
print(f"Test set class distribution: {ytest.value_counts().to_dict()}")

sc_x = StandardScaler()
xtrain = sc_x.fit_transform(xtrain)
xtest = sc_x.transform(xtest)

print("Data scaled successfully")

classifier = LogisticRegression(random_state=0)
classifier.fit(xtrain, ytrain)

y_pred = classifier.predict(xtest)

cm = confusion_matrix(ytest, y_pred)

print("Confusion Matrix : \n", cm)

print("Accuracy : ", accuracy_score(ytest, y_pred))
