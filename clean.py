import pandas as pd

if __name__ == '__main__':
    df = pd.DataFrame([[1, 2], [3, 4]], columns=['A', 'B'])
    df.append(pd.Series([5, 6], index=['A', 'B']), ignore_index=True)
    print(df)
