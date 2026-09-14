from datetime import date
from pydantic import BaseModel, Field
from typing import Literal

class TokenClaims(BaseModel):
    sub:str; tenant_id:str; role:str
class ForecastOut(BaseModel):
    id:str; branch_id:str; product_id:str; business_date:date; p10:float; p50:float; p90:float; model_version:str; data_quality:float; reasons:list[str]=[]
class RecommendationOut(BaseModel):
    id:str; forecast_id:str; branch_id:str; product_id:str; business_date:date; recommended_prep:float; risk:str
class OverrideIn(BaseModel):
    new_value:float=Field(ge=0); reason_code:Literal['LOCAL_EVENT','STOCK_CONSTRAINT','PROMOTION','WEATHER_LOCAL','MANAGER_JUDGMENT','OTHER']
class StockCountIn(BaseModel):
    branch_id:str; product_id:str; business_date:date; closing_qty:float=Field(ge=0); idempotency_key:str=Field(min_length=8,max_length=100)
class RecipeLine(BaseModel):
    ingredient_id:str; qty_per_item:float=Field(gt=0); yield_factor:float=Field(gt=0,le=1)
class IngredientNeed(BaseModel): ingredient_id:str; required_qty:float
class PurchaseLineIn(BaseModel):
    ingredient_id:str; required_qty:float=Field(ge=0); on_hand:float=Field(ge=0); pack_size:float=Field(gt=0); moq:float=Field(ge=0)
class PurchaseLineOut(BaseModel): ingredient_id:str; suggested_qty:float; packs:int
