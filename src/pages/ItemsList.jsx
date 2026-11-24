import ItemCard from '../components/ItemCard'
import { useUserStore } from "../store/useUserStore"
import { useItemStore } from "../store/useItemStore"
import { useEffect, useState } from "react"
import { api } from "../api/api"

const ItemsList = () => {
    const { session } = useUserStore()
    const [stats, setStats] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const { items, getItems } = useItemStore()
    useEffect(() => {
        const load = async () => {
            setError(null)
            setIsLoading(true)
            setStats(null)
            try {
               await getItems()    
            } catch (error) {
                console.error(error)
            } finally{
                setIsLoading(false)
            }
        }
        const loadStats = async () => {
            try { 
                const response = await api.getStats()
                setStats(response.data);
            } catch (error) {
                console.error(error)
            }
        }   
        loadStats()
        load()
    }, [])
    return (
        <div className="container">
            <div class="page-header">
                <h1>Все товары</h1>
            </div>
            <div class="stats">
                <div class="stat-item">
                    <span class="stat-value">{stats?.totalItems ?? 0}</span>
                    <span class="stat-label">Товаров</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{stats?.totalBids ?? 0}</span>
                    <span class="stat-label">Ставок</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{stats?.activeItems ?? 0}</span>
                    <span class="stat-label">Активных</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{stats?.averageItemPrice ?? 0}</span>
                    <span class="stat-label">Средняя цена</span>
                </div>
            </div>

            <div class="items-grid">            
                {items.length > 0 &&
                    items.map((item) => (
                        <ItemCard key={item.id} {...item} />
                ))}
            </div>
        </div>
    )
}

export default ItemsList
