import React from "react"

export function LoadingComponent({
    loaderVisibility,
}){
    if (loaderVisibility === true){
        return (
            <div>
                <h2>Cargando...</h2>
            </div>
        )
    }
}
  
  export default LoadingComponent;
  