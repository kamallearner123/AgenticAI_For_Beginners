from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import numpy as np

# Prepare data
X = df[['Year', 'Month']]
y = df['Quantity']

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = LinearRegression()
model.fit(X_train, y_train)


# Evaluate
y_pred = model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
print(f"RMSE: {rmse:.2f} units (Quantity)")
print(f"Coefficients: Year={model.coef_[0]:.2f}, Month={model.coef_[1]:.2f}")
print(f"Intercept: {model.intercept_:.2f}")

# Predict new data
new_data = pd.DataFrame({
    'Year': [2018, 2018],
    'Month': [1, 12]
})
predictions = model.predict(new_data)
print("\nPredictions for new data:")
for year, month, pred in zip(new_data['Year'], new_data['Month'], predictions):
    print(f"Year {year}, Month {month}: Predicted Quantity = {pred:.0f}")