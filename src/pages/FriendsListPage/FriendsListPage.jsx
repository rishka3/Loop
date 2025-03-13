import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import defaultAvatarImage from '../../assets/images/default-avatar.png';
import SearchIcon from '../../assets/icons/search.svg';
import MessengerIcon from '../../assets/icons/messenger.svg';
import DeleteIcon from '../../assets/icons/delete.svg';
import AcceptIcon from '../../assets/icons/accept.svg';
import RejectIcon from '../../assets/icons/cross.svg';

// Импорт тестовых данных
import { getUserFriends, chats, getUserFriendRequests, friendRequests } from '../../mockData/testData';

import styles from './FriendsListPage.module.css';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h4 className={styles.modalTitle}>Удалить из друзей?</h4>
                <div className={styles.modalActions}>
                    <button
                        className={`${styles.modalButton} ${styles.confirmButton}`}
                        onClick={onConfirm}
                    >
                        Да
                    </button>
                    <button
                        className={`${styles.modalButton} ${styles.cancelButton}`}
                        onClick={onClose}
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

const FriendsListPage = () => {
    const navigate = useNavigate();

    // Предположим, что текущий пользователь имеет ID 1
    const currentUserId = 1;

    const [activeTab, setActiveTab] = useState('friends');
    const [searchQuery, setSearchQuery] = useState('');

    // Обработчик для перехода к чату
    const handleMessageClick = (friendId) => {
        // Находим существующий чат или создаем новый
        let chatId = chats.find(chat =>
            chat.participants.includes(currentUserId) &&
            chat.participants.includes(friendId)
        )?.id;

        if (!chatId) {
            // Если чата нет, создаем новый
            chatId = chats.length + 1;
            chats.push({
                id: chatId,
                participants: [currentUserId, friendId],
                messages: []
            });
        }

        // Переходим к чату
        navigate(`/messenger/${chatId}`);
    };

    // Получаем друзей из тестовых данных
    const [friends, setFriends] = useState(() => {
        const userFriends = getUserFriends(currentUserId);
        return userFriends.map(friend => ({
            id: friend.id,
            name: friend.firstName,
            surname: friend.lastName,
            avatar: friend.avatar || defaultAvatarImage
        }));
    });

    const filteredFriends = friends.filter(friend =>
        `${friend.name} ${friend.surname}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    // Состояние для модального окна
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        friendId: null
    });

    // Обработчик удаления
    const handleDeleteFriend = (id) => {
        setDeleteModal({ isOpen: true, friendId: id });
    };

    // Обработчик подтверждения удаления
    const confirmDelete = () => {
        if (deleteModal.friendId) {
            setFriends(friends.filter(friend => friend.id !== deleteModal.friendId));
        }
        setDeleteModal({ isOpen: false, friendId: null });
    };

    const renderFriendsList = () => {
        if (friends.length === 0) {
            return (
                <div className={styles.emptyState}>
                    У вас пока нет друзей
                </div>
            );
        }

        if (filteredFriends.length === 0) {
            return (
                <div className={styles.emptyState}>
                    По вашему запросу ничего не найдено
                </div>
            );
        }

        return (
            <>
                {filteredFriends.map((friend) => (
                    <div key={friend.id} className={styles.friendItem}>
                        <div className={styles.friendInfo}>
                            <img
                                src={friend.avatar}
                                alt="Profile"
                                className={styles.friendAvatar}
                                onError={(e) => {
                                    e.target.src = defaultAvatarImage;
                                }}
                            />
                            <div className={styles.friendDetails}>
                                <div className={styles.friendName}>
                                    <span>{friend.name}</span>
                                    <span>{friend.surname}</span>
                                </div>
                                {/* Обновляем div для перехода к чату */}
                                <div
                                    className={styles.messageLink}
                                    onClick={() => handleMessageClick(friend.id)}
                                >
                                    <img
                                        src={MessengerIcon}
                                        alt="Message"
                                        className={styles.messageIcon}
                                    />
                                    <span>Написать сообщение</span>
                                </div>
                            </div>
                        </div>
                        <button
                            className={styles.deleteButton}
                            onClick={() => handleDeleteFriend(friend.id)}
                        >
                            <img
                                src={DeleteIcon}
                                alt="Delete"
                                className={styles.deleteIcon}
                            />
                        </button>
                    </div>
                ))}
            </>
        );
    };

    // Добавляем состояние для заявок в друзья
    const [friendRequests, setFriendRequests] = useState(() => {
        return getUserFriendRequests(currentUserId);
    });

    // ... существующий код для фильтрации друзей и обработки сообщений ...

    // Обработчики для заявок в друзья
    const handleAcceptRequest = (requestId, fromUserId) => {
        // Обновляем статус заявки
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));

        // Добавляем пользователя в список друзей
        const newFriend = getUserById(fromUserId);
        setFriends(prev => [...prev, {
            id: newFriend.id,
            name: newFriend.firstName,
            surname: newFriend.lastName,
            avatar: newFriend.avatar || defaultAvatarImage
        }]);
    };

    const handleRejectRequest = (requestId) => {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
    };

    const renderFriendRequests = () => {
        if (friendRequests.length === 0) {
            return (
                <div className={styles.emptyState}>
                    У вас нет заявок в друзья
                </div>
            );
        }

        return (
            <div className={styles.friendsList}>
                {friendRequests.map((request) => (
                    <div key={request.id} className={styles.friendItem}>
                        <div className={styles.friendInfo}>
                            <img
                                src={request.fromUser.avatar || defaultAvatarImage}
                                alt="Profile"
                                className={styles.friendAvatar}
                                onError={(e) => {
                                    e.target.src = defaultAvatarImage;
                                }}
                            />
                            <div className={styles.friendDetails}>
                                <div className={styles.friendName}>
                                    <span>{request.fromUser.firstName}</span>
                                    <span>{request.fromUser.lastName}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.requestActions}>
                            <button
                                className={`${styles.actionButton} ${styles.acceptButton}`}
                                onClick={() => handleAcceptRequest(request.id, request.fromUser.id)}
                            >
                                <img
                                    src={AcceptIcon}
                                    alt="Accept"
                                    className={styles.actionIcon}
                                />
                            </button>
                            <button
                                className={`${styles.actionButton} ${styles.rejectButton}`}
                                onClick={() => handleRejectRequest(request.id)}
                            >
                                <img
                                    src={RejectIcon}
                                    alt="Reject"
                                    className={styles.actionIcon}
                                />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.friendsPageContainer}>
            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tab} ${activeTab === 'friends' ? styles.active : ''}`}
                    onClick={() => setActiveTab('friends')}
                >
                    Друзья
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    Заявки
                </button>
            </div>

            {activeTab === 'friends' ? (
                <>
                    <div className={styles.searchContainer}>
                        <div className={styles.searchInputWrapper}>
                            <input
                                type="text"
                                placeholder="Поиск друзей"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                            <img
                                src={SearchIcon}
                                alt="Search"
                                className={styles.searchIcon}
                            />
                        </div>
                    </div>
                    <div className={styles.friendsList}>
                        {renderFriendsList()}
                    </div>
                </>
            ) : (
                renderFriendRequests()
            )}

            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, friendId: null })}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default FriendsListPage;