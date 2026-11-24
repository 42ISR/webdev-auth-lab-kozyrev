import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Input from '../components/Input'
import Button from '../components/Button'
import { useItemStore } from '../store/useItemStore'
import { useUserStore } from '../store/useUserStore'
import { api } from '../api/api'

const getErrorMessage = (error) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Произошла ошибка'
    
const ItemDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    
    const items = useItemStore((state) => state.items)
    const getItems = useItemStore((state) => state.getItems)
    const session = useUserStore((state) => state.session)

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null) 
    const [bids, setBids] = useState([]) 

    const item = items.find((i) => String(i.id) === String(id))
    
    const loadBids = async () => {
        try {
            const data = await api.getItemBids(id)
            setBids(data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        const load = async () => {
            try {
            setIsLoading(true)
            await getItems()
            await loadBids()
            setIsLoading(false)
            } catch (error) {
                console.error(error)
            }
        }
        load()
    }, [id])

    const handleBid = async (e) => {
        e.preventDefault()
        setError(null)

        const form = e.target
        const amount = Number(form.bidInput.value)

        try {
            await api.createBid({ id, amount })
            form.reset()
            await getItems()
            await loadBids()
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }

    const handleDelete = async () => {
        try {
            await api.deleteItems(id)
            await getItems()
            navigate('/')
        } catch (err) {
            setError(getErrorMessage(err))
        }
    }
    if (isLoading) return <div className="container">Загрузка...</div>
    if (!item) return <div className="container">Товар не найден</div>
    const isOwner = session?.user?.id === item.userId
    return (
        <div className="container">
            <Link to={'/'}>← Вернуться к списку товаров</Link>

            <div class="item-detail">
                <div class="item-header">
                    <div>
                        <img src={item.imageUrl} class="item-image-large" />
                    </div>

                    <div class="item-info">
                        <span class="item-status">{item.status}</span>

                        <h1 class="item-title-large">{item.title}</h1>

                        <div class="item-seller-info">
                            <div class="seller-avatar"> {item.username.slice(0, 2).toUpperCase()} </div>
                            <div class="seller-details">
                            <div class="seller-name">{item.username}</div>
                                <div class="seller-date">
                                    {new Date(item.createdAt).toLocaleString('ru-RU')}
                                </div>
                            </div>
                        </div>

                        <div class="item-description-full">{item.description}</div>

                        <div class="price-section">
                            <div class="starting-price">Начальная цена:</div>
                            <div class="current-price">{item.price}</div>
                            <div class="highest-bid">
                                Текущая ставка:{' '}
                                {item.highestBid === null ? 'ставок нет' : `${item.highestBid} ₽`}
                            </div>

                            <form class="bid-form" onSubmit={handleBid}>
                                <Input
                                    type="number"
                                    name="bidInput"
                                    class="bid-input"
                                    placeholder="Введите вашу ставку (мин. стоимость + 1 рубль ₽)"
                                    min={item.highestBid ?? item.price}
                                    step="100"
                                />
                                <Button type="submit" class="btn-bid">
                                    Сделать ставку
                                </Button>
                            </form>

                            {isOwner && (
                                <button
                                    type="button"
                                    className="btn-delete"
                                    onClick={handleDelete}
                                >
                                    Удалить товар
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div class="bids-section">
                    <div class="bids-header">
                        <h2 class="bids-title">История ставок</h2>
                        <span class="bids-count">5</span>
                    </div>

                    <div className="bids-list">
                        {bids.map((bid, index) => (
                            <div
                                key={bid.id}
                                className={`bid-item${index === 0 ? ' highest-bid-item' : ''}`}
                            >
                                <div className="bid-user">
                                    <div className="bid-avatar">
                                        {bid.username.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="bid-details">
                                        <span className="bid-username">{bid.username}</span>
                                        <span className="bid-time">
                                            {new Date(bid.createdAt).toLocaleString('ru-RU')}
                                        </span>
                                    </div>
                                    {index === 0 && (
                                        <span className="highest-badge">🏆 Лидирует</span>
                                    )}
                                </div>
                                <div className="bid-amount">{bid.amount} ₽</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ItemDetail
