import { api } from "../api/api"
import {create} from "zustand"

export const useItemStore = create((set) => ({
    items: [],
    getItems: async () => {
        try{
            const res = await api.getItems()
            set({ items: res.data })
        }
        catch(error){ console.error(error)}

    }
}))