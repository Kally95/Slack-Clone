import {createContext, useContext} from "react";

const OrganisationContext = createContext();

export function OrganisationProvider({children}) {


    return (
        <OrganisationContext.Provider value={}>
            {children}
        </OrganisationContext.Provider>)
}

export function useOrganisationContext() {
    return useContext(OrganisationContext)
}