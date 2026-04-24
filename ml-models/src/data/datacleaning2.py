
import numpy as np
import pandas as pd
import os

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(script_dir, '..', '..')
dataset_dir = os.path.join(project_root, 'data', 'interim')

# Load data from local data/interim folder
data_path = os.path.join(dataset_dir, 'allData.csv')
data = pd.read_csv(data_path)

data.head()


def label5(row):
    if row['Hair growth on Chin'] == 'normal':
        return 0
    elif row['Hair growth on Chin'] == 'moderate':
        return 1
    else:
        return 2


data['Hair growth on Chin'] = data.apply(lambda row: label5(row), axis=1)
print(data.head())


def label16(row):
    if row['relocated city'] == 'Yes':
        return 1
    else:
        return 0


data['relocated city'] = data.apply(lambda row: label16(row), axis=1)
print(data.head())

# Save intermediate file
output_path = os.path.join(project_root, 'data', 'interim', 'data.csv')
data.to_csv(output_path)
print(f"Saved data.csv to {output_path}")


def label17(row):
    if row['Period Length'] == '2-3 days':
        return 3
    elif row['Period Length'] == '4-5 days':
        return 5
    elif row['Period Length'] == '6-7 days':
        return 7
    else:
        return 9


data['Period Length'] = data.apply(lambda row: label17(row), axis=1)
print(data.head())


def label18(row):
    if row['Cycle Length'] == '20-24 days':
        return 22
    elif row['Cycle Length'] == '20-28 days':
        return 25
    elif row['Cycle Length'] == '25-28':
        return 27
    elif row['Cycle Length'] == '29-35 days':
        return 32
    elif row['Cycle Length'] == '36+ days':
        return 37
    else:
        return 'NaN'


data['Cycle Length'] = data.apply(lambda row: label18(row), axis=1)
print(data.head())

del data['PCOS_from']

print(data)

# Save final cleaned data
final_output_path = os.path.join(project_root, 'data', 'interim', 'data_final.csv')
data.to_csv(final_output_path)
print(f"Saved data_final.csv to {final_output_path}")

# Load data for further processing
data1_path = os.path.join(project_root, 'data', 'interim', 'data.csv')
data1 = pd.read_csv(data1_path)
print(data1.head())


def label17(row):
    if row['Period Length'] == '2-3 days':
        return 3
    elif row['Period Length'] == '4-5 days':
        return 5
    elif row['Period Length'] == '6-7 days':
        return 7
    else:
        return 9


data1['Period Length'] = data.apply(lambda row: label17(row), axis=1)
data1.head()


def label18(row):
    if row['Cycle Length'] == '20-24 days':
        return 1
    elif row['Cycle Length'] == '20-28 days':
        return 2
    elif row['Cycle Length'] == '25-28':
        return 3
    elif row['Cycle Length'] == '29-35 days':
        return 4
    elif row['Cycle Length'] == '36+ days':
        return 5
    else:
        return 6


data1['Cycle Length'] = data.apply(lambda row: label18(row), axis=1)
data1.head()


def label19(row):
    if row['Age'] == 'Below 18':
        return 1
    elif row['Age'] == '18-25':
        return 2
    elif row['Age'] == '26-30':
        return 3
    elif row['Age'] == '31-35':
        return 4
    elif row['Age'] == '36-40':
        return 5
    elif row['Age'] == '41-45':
        return 6
    else:
        return 7


data1['Age'] = data1.apply(lambda row: label19(row), axis=1)
print(data1.head())

# Encode all remaining categorical columns
def encode_yes_no(value):
    if value == 'Yes':
        return 1
    elif value == 'No':
        return 0
    else:
        return value

def encode_hair_growth(value):
    if value == 'normal':
        return 0
    elif value == 'moderate':
        return 1
    elif value == 'excessive':
        return 2
    else:
        return value

def encode_difficulty(value):
    if value == 'Not Applicable':
        return 0
    elif value == 'Yes':
        return 1
    elif value == 'No':
        return 2
    else:
        return value

# Apply encodings
yes_no_cols = ['Overweight', 'loss weight gain / weight loss', 'irregular or missed periods', 
               'Acne or skin tags', 'Hair thinning or hair loss ', 'Dark patches', 
               'always tired', 'more Mood Swings', 'canned food often', 'PCOS']

hair_cols = ['Hair growth  on Cheeks', 'Hair growth Between breasts', 
             'Hair growth  on Upper lips ', 'Hair growth in Arms', 'Hair growth on Inner thighs']

for col in yes_no_cols:
    if col in data1.columns:
        data1[col] = data1[col].apply(encode_yes_no)

for col in hair_cols:
    if col in data1.columns:
        data1[col] = data1[col].apply(encode_hair_growth)

if 'Difficulty in conceiving' in data1.columns:
    data1['Difficulty in conceiving'] = data1['Difficulty in conceiving'].apply(encode_difficulty)

# Fill NaN values with 0
data1 = data1.fillna(0)

# Convert all columns to numeric
for col in data1.columns:
    if col not in ['City', 'PCOS_from', 'Unnamed: 0']:
        data1[col] = pd.to_numeric(data1[col], errors='coerce')

data1 = data1.fillna(0)

# Drop unnecessary columns
cols_to_drop = ['Unnamed: 0', 'City', 'PCOS_from']
for col in cols_to_drop:
    if col in data1.columns:
        del data1[col]

print("\nFinal cleaned data:")
print(data1.head())
print(f"\nData types:\n{data1.dtypes}")
print(f"\nData shape: {data1.shape}")

# Save cleaned data
cleaned_output_path = os.path.join(project_root, 'data', 'processed', 'clean_data.csv')
data1.to_csv(cleaned_output_path, index=False)
print(f"\nSaved clean_data.csv to {cleaned_output_path}")
