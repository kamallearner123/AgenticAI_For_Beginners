# Baseline models
from sklearn.dummy import DummyRegressor, DummyClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error
from sklearn.metrics import accuracy_score



# Regression baseline: predict the mean
baseline_reg = Pipeline(steps=[("prep", preprocessor), ("mdl", DummyRegressor(strategy="mean"))])
baseline_reg.fit(X_train_r, y_train_r)
pred_r = baseline_reg.predict(X_test_r)
print("Baseline (Reg) RMSE:", mean_squared_error(y_test_r, pred_r, squared=False))

# Classification baseline: most frequent class
baseline_clf = Pipeline(steps=[("prep", preprocessor), ("mdl", DummyClassifier(strategy="most_frequent"))])
baseline_clf.fit(X_train_c, y_train_c)
pred_c = baseline_clf.predict(X_test_c)
print("Baseline (Clf) ACC:", accuracy_score(y_test_c, pred_c))