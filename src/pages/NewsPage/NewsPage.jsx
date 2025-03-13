import { useState } from 'react';

import PlusIcon from '../../assets/icons/plus.svg';
import CategoryIcon from '../../assets/icons/category.svg';
import defaultPostImage from '../../assets/images/default-post.png';
import defaultAvatarImage from '../../assets/images/default-avatar.png';

// Импорт тестовых данных
import { posts, users, categories } from '../../mockData/testData';

import './NewsPage.css';


function NewsPage() {
    // Текущий пользователь (для определения лайкнул ли он пост)
    const currentUserId = 1;

    // Инициализируем состояние постов, объединяя данные постов с данными их авторов
    const [allPosts, setAllPosts] = useState(() => {
        return posts.map(post => ({
            ...post, // копируем все свойства поста
            // Находим автора поста и добавляем его данные
            author: users.find(user => user.id === post.authorId),
            // Проверяем, лайкнул ли текущий пользователь пост
            likes: post.likedBy.length,
            isLiked: post.likedBy.includes(currentUserId)
        }));
    });

    // Форматирование даты поста
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();

        // Если пост создан сегодня, показываем только время
        if (isToday) {
            return date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Иначе показываем дату
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long'
        });
    };

    // Обработчик лайков
    const handleLike = (postId) => {
        setAllPosts(allPosts.map(post => {
            if (post.id === postId) {
                // Обновляем количество лайков и статус лайка для текущего поста
                const newLikedBy = post.isLiked
                    ? post.likedBy.filter(id => id !== currentUserId)
                    : [...post.likedBy, currentUserId];

                return {
                    ...post,
                    likedBy: newLikedBy,
                    isLiked: !post.isLiked,
                    likes: newLikedBy.length
                };
            }
            return post;
        }));
    };

    return (
        <div className="news-page">
            <div className="news-page-main-content">
                {/* Кнопка создания поста */}
                <button className="create-post-button">
                    <img
                        src={PlusIcon}
                        alt="Create"
                        className="create-post-icon"
                    />
                    <span>Создать пост</span>
                </button>

                {/* Контейнер с постами */}
                <div className="posts-container">
                    {allPosts.map(post => (
                        <article key={post.id} className="post">
                            {/* Шапка поста с информацией об авторе */}
                            <div className="post-header">
                                <img
                                    src={post.author.avatar || defaultAvatarImage}
                                    alt="Avatar"
                                    className="author-avatar"
                                    onError={(e) => {
                                        e.target.src = defaultAvatarImage;
                                    }}
                                />
                                <div className="author-info">
                                    <div className="author-name">
                                        <span>{post.author.firstName}</span>
                                        <span>{post.author.lastName}</span>
                                    </div>
                                    <div className="post-date">
                                        {formatDate(post.createdAt)}
                                    </div>
                                </div>
                            </div>

                            {/* Текст поста */}
                            {post.text && (
                                <p className="post-text">{post.text}</p>
                            )}

                            {/* Изображение поста и кнопка лайка */}
                            {post.image && (
                                <div className="post-content">
                                    <img
                                        src={post.image || defaultPostImage}
                                        alt="Post content"
                                        className="post-image"
                                        onError={(e) => {
                                            e.target.src = defaultPostImage;
                                        }}
                                    />
                                    <div className="post-actions">
                                        <button
                                            className={`like-button ${post.isLiked ? 'liked' : ''}`}
                                            onClick={() => handleLike(post.id)}
                                        >
                                            {post.isLiked ? '❤️' : '🤍'} {post.likes}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </div>

            {/* Боковая панель с категориями */}
            <div className="categories-sidebar">
                <div className="categories-header">
                    <img
                        src={CategoryIcon}
                        alt="Categories"
                        className="category-icon"
                    />
                    <h2>Категории</h2>
                </div>
                <div className="categories-list">
                    {categories.map(category => (
                        <div key={category} className="category-item">
                            {category}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NewsPage;