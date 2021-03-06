import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext>({} as CartContext);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
       const storageProducts =  await AsyncStorage.getItem('@GoMarketPlace-Itens'); 
        

       if(storageProducts){
          setProducts([...JSON.parse(storageProducts)]);
       }

      }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productExists = products.find(p => p.id == product.id);

    if(productExists){

        increment(productExists.id);
      }else{

      setProducts([...products, {...product, quantity: 1}]);
    }

    


    await AsyncStorage.setItem('@GoMarketPlace-Itens', JSON.stringify(products));
  }, [products]);

  const increment = useCallback(async id => {
      const productsIncrement = products.map(product => product.id == id ? {...product, quantity: product.quantity += 1} : product);
      setProducts(productsIncrement)

      await AsyncStorage.setItem('@GoMarketPlace-Itens', JSON.stringify(products));
    }, [products]);

  const decrement = useCallback(async id => {
       const decrementProduct = products.map(product => {
         if(product.id == id){
             return {...product, quantity: product.quantity -= 1}
         }else{
          return product
         }
       });

       setProducts(decrementProduct);
       await AsyncStorage.setItem('@GoMarketPlace-Itens', JSON.stringify(products));
  }, [products]);


  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
