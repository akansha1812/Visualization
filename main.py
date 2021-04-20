import numpy as np
from pandas import DataFrame
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
from sklearn import manifold
from flask import Flask, jsonify
from flask import render_template, request, redirect, Response
from sklearn.manifold import MDS
from sklearn import preprocessing
from sklearn.metrics.pairwise import pairwise_distances

app = Flask(__name__)

@app.route("/barScree")
def barScree():
    list =[]
    for v,c,p in zip(var_ratio, out_sum,pc_columns):
        list.append({"cpd": c , "PC" : p ,"Variance": v})
    return jsonify(list)



@app.route("/scatterMatrix/<prop>")
def ScatterMatrix(prop):
    loading_cols = pc_columns[:int(prop)]
    loadings = loadings_df[loading_cols]
    attr = loadings.pow(2).sum(axis=1).sort_values(ascending=False).head(4).index.values
    df = df_fifa[attr]
    dict_df = list(df.T.to_dict().values())
    return jsonify(dict_df)


# to create loading data
def loadData(n,pcnumber):
    loading_cols = pc_columns[:n]
    loadings = loadings_df[loading_cols]
    attr = loadings.pow(2).sum(axis=1).sort_values(ascending=False).head(pcnumber).index.values
    loadings = loadings[loadings.index.isin(attr)]
    loadings['Attribute'] = loadings.index
    loadings = loadings.reset_index(drop=True)
    return loadings

@app.route("/LoadingTable/<prop>")
def LoadingTable(prop):
    prop = int(prop)
    loadings = loadData(prop,4)
    result = list(loadings.T.to_dict().values())
    return jsonify((result))


@app.route("/biplot")
def biplot():
    df = pca_fifa_df[['PC1', 'PC2']]
    result = list(df.T.to_dict().values())
    return jsonify((result))

@app.route("/biplotAttr")
def biplotAttr():
    loadings = loadData(2,11)
    result = list(loadings.T.to_dict().values())
    return jsonify((result))

@app.route("/kmeans/<prop>")
def kmean(prop):
    loading_cols = pc_columns[:int(prop)]
    loadings = loadings_df[loading_cols]
    attr = loadings.pow(2).sum(axis=1).sort_values(ascending=False).head(4).index.values
    df = df_fifa[attr].copy()
    kmeans = KMeans(n_clusters=3).fit(df)
    predictions = kmeans.predict(df)
    df['c'] = kmeans.labels_
    result = list(df.T.to_dict().values())
    return jsonify(result)


@app.route("/mds_eu")
def mds_eu():
    embd = MDS(n_components=2, dissimilarity='precomputed')
    data = preprocessing.scale(df_fifa)
    dmatrix_euc = pairwise_distances(data, metric='euclidean')
    mds_euc = embd.fit_transform(dmatrix_euc)
    mds_euc = pd.DataFrame(mds_euc, columns=['MDS1', 'MDS2'])
    mds_euc = pd.DataFrame(scaler.fit_transform(mds_euc), columns=mds_euc.columns)
    kmeans_t3 = KMeans(n_clusters=3).fit(mds_euc)
    predictions = kmeans_t3.predict(mds_euc)
    mds_euc['c'] = kmeans_t3.labels_
    result = list(mds_euc.T.to_dict().values())
    return jsonify(result)

@app.route("/mds_cor")
def mds_cor():
    embd = MDS(n_components=2, dissimilarity='precomputed')
    df = df_fifa.copy()
    dmatrix_cor = df.corr()
    mds_cor = embd.fit_transform(dmatrix_cor)
    mds_cor = pd.DataFrame(mds_cor, columns=['MDS1', 'MDS2'])
    mds_cor= mds_cor.abs()
    mds_cor = mds_cor.mul(-1)
    mds_cor = mds_cor.add(1)
    cols_corr = np.array(['Age', 'Value','Wages', 'Weight', 'Finishing', 'Heading', 'ShortPassing','Dribbling', 'Stamina', 'Strength', 'Penalties'])
    print(mds_cor)
    print(mds_cor.columns)
    mds_cor["attribute"] = cols_corr
    print(mds_cor)
    result = list(mds_cor.T.to_dict().values())
    return jsonify(result)

@app.route("/pcp")
def pcp():
    df = df_fifa.copy()
    kmeans = KMeans(n_clusters=3).fit(df)
    predictions = kmeans.predict(df)
    df['c'] = kmeans.labels_
    df_complete = pd.merge(df_source, df, on=['Age', 'Value', 'Wages',
       'Weight', 'Finishing', 'Heading', 'ShortPassing',
       'Dribbling', 'Stamina', 'Strength', 'Penalties'])
    result = list(df_complete.T.to_dict().values())
    return jsonify(result)


df_source= pd.read_csv('Final_data.csv')
df_fifa= pd.read_csv('Final_data.csv')[['Age', 'Value','Wages', 'Weight', 'Finishing', 'Heading', 'ShortPassing','Dribbling', 'Stamina', 'Strength', 'Penalties']]
pc_columns = ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6','PC7','PC8', 'PC9', 'PC10','PC11']

scaler = StandardScaler()
scaled_fifa = df_fifa.copy()
scaled_fifa=pd.DataFrame(scaler.fit_transform(scaled_fifa), columns=scaled_fifa.columns)
pca = PCA(n_components=11)
Principal_components=pca.fit_transform(scaled_fifa)

minmax = MinMaxScaler(feature_range=(-1,1))
Principal_components =minmax.fit_transform(Principal_components)

pca_fifa_df = pd.DataFrame(data = Principal_components, columns =pc_columns )
loadings_df = pd.DataFrame(pca.components_.T, index=df_fifa.columns, columns=pc_columns)
var_ratio=pca.explained_variance_ratio_
out_sum = np.cumsum(var_ratio)



@app.route("/")
def d3_main():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True, port=3000)
