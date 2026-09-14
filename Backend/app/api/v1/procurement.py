from fastapi import APIRouter, Depends
from app.api.deps import current_claims
from app.schemas.core import RecipeLine, PurchaseLineIn
from app.services.recommendation import explode_recipe,suggest_purchase
router=APIRouter(prefix='/decision',tags=['decision'])
@router.post('/ingredient-needs')
async def ingredient_needs(forecast_items:float,lines:list[RecipeLine],claims=Depends(current_claims)):
    return explode_recipe(forecast_items,[x.model_dump() for x in lines])
@router.post('/purchase-suggestions')
async def purchase_suggestions(lines:list[PurchaseLineIn],claims=Depends(current_claims)):
    out=[]
    for x in lines:
        qty,packs=suggest_purchase(x.required_qty,x.on_hand,x.pack_size,x.moq)
        out.append({'ingredient_id':x.ingredient_id,'suggested_qty':qty,'packs':packs,'requires_human_approval':True})
    return out
