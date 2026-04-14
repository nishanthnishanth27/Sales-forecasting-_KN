# 📊 Sales Forecasting System

A complete, interactive **Sales Forecasting System** built with HTML + JavaScript. No backend needed — runs entirely in the browser.

## 🚀 Live Demo

Open `index.html` in any browser. That's it.

---

## 📁 Project Structure

```
sales-forecasting-system/
├── index.html        ← FULL system (all-in-one file)
└── README.md
```

---

## 🗺️ System Steps (7-Step Pipeline)

| Step | Title | What It Does |
|------|-------|-------------|
| 01 | **Load & Explore** | Generates 5 years of synthetic sales data, displays metrics & raw chart |
| 02 | **Clean Data** | Shows missing values + outlier detection (Z-score / IQR), before/after charts |
| 03 | **Feature Engineering** | Lag features (7/14/30d), rolling averages, calendar features |
| 04 | **Train/Test Split** | Chronological 80/20 split — no data leakage |
| 05 | **Train Models** | ARIMA, Prophet, XGBoost — with convergence chart |
| 06 | **Evaluate** | MAE, RMSE, MAPE comparison table + residual histogram |
| 07 | **Visualize** | Actual vs Predicted, 90-day future forecast with confidence intervals |

---

## 🤖 Models Used

### ARIMA (AutoRegressive Integrated Moving Average)
- Best for **stationary time-series**
- Python: `from statsmodels.tsa.arima.model import ARIMA`
- Parameters: `order=(5,1,0)`

### Prophet (by Meta)
- Handles **seasonality**, holidays, and trends automatically
- Python: `from prophet import Prophet`
- Config: `seasonality_mode='multiplicative'`

### XGBoost ⭐ Best Model
- Powerful **gradient boosting** on engineered features
- Python: `from xgboost import XGBRegressor`
- Config: `n_estimators=300, max_depth=6, learning_rate=0.05`

---

## 📐 Evaluation Metrics

```python
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

def mape(y_true, y_pred):
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100

mae  = mean_absolute_error(y_test, pred)
rmse = np.sqrt(mean_squared_error(y_test, pred))
mape_val = mape(y_test, pred)
```

---

## 🐍 Python Version (Full Code)

Install dependencies:
```bash
pip install pandas numpy scikit-learn xgboost statsmodels prophet matplotlib
```

```python
import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error
from statsmodels.tsa.arima.model import ARIMA
from prophet import Prophet
from xgboost import XGBRegressor
import matplotlib.pyplot as plt

# ── 1. LOAD DATA ──────────────────────────────────────
df = pd.read_csv('sales_data.csv', parse_dates=['date'])
df.set_index('date', inplace=True)
print(df.head())
print(df.info())
print(df.describe())

# ── 2. CLEAN DATA ─────────────────────────────────────
from scipy import stats

# Fill missing
df['sales'] = df['sales'].interpolate(method='linear')

# Detect outliers (Z-score)
z_scores = np.abs(stats.zscore(df['sales']))
outliers = df[z_scores > 3]
print(f"Outliers detected: {len(outliers)}")

# Cap using IQR
Q1 = df['sales'].quantile(0.25)
Q3 = df['sales'].quantile(0.75)
IQR = Q3 - Q1
df['sales'] = df['sales'].clip(Q1 - 1.5 * IQR, Q3 + 1.5 * IQR)

# ── 3. FEATURE ENGINEERING ────────────────────────────
df['day_of_week']  = df.index.dayofweek
df['month']        = df.index.month
df['quarter']      = df.index.quarter
df['year']         = df.index.year
df['week']         = df.index.isocalendar().week.astype(int)

# Lag features
df['lag_7']   = df['sales'].shift(7)
df['lag_14']  = df['sales'].shift(14)
df['lag_30']  = df['sales'].shift(30)

# Rolling stats
df['roll_7_mean']  = df['sales'].rolling(7).mean()
df['roll_30_mean'] = df['sales'].rolling(30).mean()
df['roll_7_std']   = df['sales'].rolling(7).std()

df.dropna(inplace=True)

# ── 4. TRAIN / TEST SPLIT ─────────────────────────────
split_date = '2024-01-01'
train = df[df.index < split_date]
test  = df[df.index >= split_date]

features = ['lag_7','lag_14','lag_30','roll_7_mean',
            'roll_30_mean','roll_7_std','day_of_week','month','quarter']

X_train, y_train = train[features], train['sales']
X_test,  y_test  = test[features],  test['sales']
print(f"Train: {len(train)} | Test: {len(test)}")

# ── 5. TRAIN MODELS ───────────────────────────────────

# XGBoost
xgb = XGBRegressor(n_estimators=300, max_depth=6, learning_rate=0.05,
                   subsample=0.8, colsample_bytree=0.8, random_state=42)
xgb.fit(X_train, y_train)
xgb_pred = xgb.predict(X_test)

# ARIMA
arima_model = ARIMA(y_train, order=(5, 1, 0)).fit()
arima_pred  = arima_model.forecast(steps=len(y_test))

# Prophet
prophet_df = train.reset_index().rename(columns={'date': 'ds', 'sales': 'y'})
m = Prophet(seasonality_mode='multiplicative', yearly_seasonality=True)
m.fit(prophet_df)
future = m.make_future_dataframe(periods=len(test))
forecast = m.predict(future)
prophet_pred = forecast.tail(len(test))['yhat'].values

# ── 6. EVALUATE ───────────────────────────────────────
def mape(y_true, y_pred):
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100

predictions = {'XGBoost': xgb_pred, 'ARIMA': arima_pred, 'Prophet': prophet_pred}

for name, pred in predictions.items():
    mae_val  = mean_absolute_error(y_test, pred)
    rmse_val = np.sqrt(mean_squared_error(y_test, pred))
    mape_val = mape(y_test.values, pred)
    print(f"{name:10} → MAE: {mae_val:.2f} | RMSE: {rmse_val:.2f} | MAPE: {mape_val:.2f}%")

# ── 7. VISUALIZE ──────────────────────────────────────
fig, axes = plt.subplots(2, 1, figsize=(14, 8), facecolor='#080c14')
ax1, ax2 = axes

ax1.plot(y_test.values, label='Actual', color='white', lw=2)
ax1.plot(xgb_pred,    label='XGBoost', color='#00e5ff', lw=1.5)
ax1.plot(arima_pred,  label='ARIMA',   color='#ff6b35', lw=1.5, linestyle='--')
ax1.plot(prophet_pred,label='Prophet', color='#a259ff', lw=1.5, linestyle=':')
ax1.set_title('Actual vs Predicted Sales (2024)', color='white')
ax1.legend(facecolor='#0e1623', labelcolor='white')
ax1.set_facecolor('#0e1623')

residuals = y_test.values - xgb_pred
ax2.scatter(range(len(residuals)), residuals, s=8, color='#a259ff', alpha=0.7)
ax2.axhline(0, color='#00ff88', lw=1.5)
ax2.set_title('XGBoost Residuals', color='white')
ax2.set_facecolor('#0e1623')

plt.tight_layout()
plt.savefig('forecast_results.png', dpi=150, bbox_inches='tight')
plt.show()
```

---

## 📊 Export

The HTML system has a **"Export Forecast CSV"** button that downloads:
```
date, actual, xgboost_pred, arima_pred, prophet_pred, xgb_residual
```

---

## 🛠️ How to Use on GitHub Pages

1. Fork / clone this repo
2. Go to **Settings → Pages → Source: main / root**
3. Visit `https://yourusername.github.io/sales-forecasting-system/`

---

