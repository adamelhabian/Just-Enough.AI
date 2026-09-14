import httpx
from .base import ERPAdapter
class FoodicsAdapter(ERPAdapter):
    def __init__(self,token:str,base_url:str='https://api.foodics.com/v5'):
        self.token=token; self.base_url=base_url.rstrip('/')
    def _headers(self): return {'Authorization':f'Bearer {self.token}','Accept':'application/json'}
    async def _get_paginated(self,path:str,params:dict|None=None):
        items=[]; page=1; params=dict(params or {})
        async with httpx.AsyncClient(timeout=30) as client:
            while True:
                q={**params,'page':page}
                r=await client.get(f'{self.base_url}/{path.lstrip("/")}',headers=self._headers(),params=q); r.raise_for_status(); data=r.json()
                batch=data.get('data',data if isinstance(data,list) else [])
                items.extend(batch)
                meta=data.get('meta',{}) if isinstance(data,dict) else {}
                if not meta or page>=int(meta.get('last_page',page)): break
                page+=1
        return items
    async def fetch_sales(self,since_iso:str)->list[dict]: return await self._get_paginated('/orders',{'filter[updated_after]':since_iso})
    async def fetch_products(self)->list[dict]: return await self._get_paginated('/products')
