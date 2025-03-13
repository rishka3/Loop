import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import defaultAvatarImage from '../../assets/images/default-avatar.png';

// Импорт тестовых данных
import {
  chats,
  users,
  getUserById,
  getChatsByUserId,
  getLastMessageFromChat
} from '../../mockData/testData';

import styles from './ChatListPage.module.css';

// Иконки статусов сообщений
const MessageStatusIcon = ({ status }) => {
  switch (status) {
    case 'Отправлено':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10L8 14L16 6" stroke="#BEBBBB" strokeWidth="2" />
          <path d="M2 10L6 14L14 6" stroke="#BEBBBB" strokeWidth="2" />
        </svg>
      );
    case 'Получено':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10L8 14L16 6" stroke="#AEE1FF" strokeWidth="2" />
          <path d="M2 10L6 14L14 6" stroke="#AEE1FF" strokeWidth="2" />
        </svg>
      );
    case 'Новое сообщение':
      return (
        <div className={styles.newMessageIndicator}>
          <span>!</span>
        </div>
      );
    case 'Прочитано':
      return null;
    default:
      return null;
  }
};

const SendIcon = () => (
  <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
    <path
      d="M27.5 2.5L13.75 16.25"
      stroke="#AEE1FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M27.5 2.5L18.75 27.5L13.75 16.25L2.5 11.25L27.5 2.5Z"
      stroke="#AEE1FF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h4 className={styles.modalTitle}>Удалить сообщение?</h4>
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

function ChatListPage({ initialChatId }) {
  // Предположим, что текущий пользователь имеет ID 1
  const currentUserId = 1;

  // Состояние для хранения обработанных чатов
  const [processedChats, setProcessedChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, messageId: null });

  const { chatId } = useParams();

  // Инициализация чатов при загрузке компонента
  useEffect(() => {
    // Получаем чаты текущего пользователя
    const userChats = getChatsByUserId(currentUserId);

    // Обрабатываем каждый чат для отображения
    const processed = userChats.map(chat => {
      // Находим ID собеседника (не текущего пользователя)
      const companionId = chat.participants.find(id => id !== currentUserId);
      const companion = getUserById(companionId);
      const lastMessage = getLastMessageFromChat(chat.id);

      // Определяем статус последнего сообщения
      let messageStatus = '';
      if (lastMessage) {
        if (lastMessage.senderId === currentUserId) {
          // Если последнее сообщение от текущего пользователя
          messageStatus = lastMessage.status === 'read' ? 'Получено' : 'Отправлено';
        } else {
          // Если последнее сообщение от собеседника
          messageStatus = lastMessage.status === 'read' ? 'Прочитано' : 'Новое сообщение';
        }
      }

      return {
        id: chat.id,
        name: companion.firstName,
        surname: companion.lastName,
        avatar: companion.avatar || defaultAvatarImage,
        messageStatus,
        messages: chat.messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          isOwn: msg.senderId === currentUserId,
          isRead: msg.status === 'read'
        }))
      };
    });

    setProcessedChats(processed);

    // Проверяем сначала chatId из URL, затем initialChatId
    if (chatId) {
      const targetChat = processed.find(chat => chat.id === parseInt(chatId));
      if (targetChat) {
        setSelectedChat(targetChat);
      }
    } else if (initialChatId) {
      const initialChat = processed.find(chat =>
        chat.participants && chat.participants.includes(initialChatId)
      );
      if (initialChat) {
        setSelectedChat(initialChat);
      }
    }
  }, [currentUserId, initialChatId, chatId]);

  // Обработчик отправки сообщения
  const handleSendMessage = e => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const newMsg = {
      id: Date.now(),
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isOwn: true,
      isRead: false,
    };

    setProcessedChats(prevChats => {
      // Создаем новый массив чатов с обновленными сообщениями
      const updatedChats = prevChats.map(chat =>
        chat.id === selectedChat.id
          ? {
            ...chat,
            messages: [...chat.messages, newMsg],
            // Обновляем статус последнего сообщения
            messageStatus: 'Отправлено'
          }
          : chat
      );

      // Находим обновленный выбранный чат
      const updatedSelectedChat = updatedChats.find(
        chat => chat.id === selectedChat.id
      );

      // Обновляем выбранный чат
      setSelectedChat(updatedSelectedChat);

      return updatedChats;
    });

    // Очищаем поле ввода
    setNewMessage('');
  };

  // Обработчик удаления сообщения
  const handleDeleteMessage = messageId => {
    setDeleteModal({ isOpen: true, messageId });
  };

  // Подтверждение удаления сообщения
  const confirmDelete = () => {
    if (!selectedChat || !deleteModal.messageId) return; // Дополнительная проверка

    setProcessedChats(prevChats => {
      // Создаем новый массив чатов
      const updatedChats = prevChats.map(chat => {
        // Если это выбранный чат
        if (chat.id === selectedChat.id) {
          // Создаем новый объект чата с обновленными сообщениями
          const updatedMessages = chat.messages.filter(
            msg => msg.id !== deleteModal.messageId
          );

          return {
            ...chat,
            messages: updatedMessages
          };
        }
        return chat;
      });

      // Обновляем выбранный чат
      const updatedSelectedChat = updatedChats.find(
        chat => chat.id === selectedChat.id
      );
      setSelectedChat(updatedSelectedChat);

      return updatedChats;
    });

    // Закрываем модальное окно
    setDeleteModal({ isOpen: false, messageId: null });
  };

  return (
    <div className={styles.chatListPage}>
      {/* Список чатов */}
      <div className={styles.chatListContainer}>
        <div className={styles.chatListHeader}>Чаты</div>
        <div className={styles.chatList}>
          {processedChats.map(chat => (
            <div
              key={chat.id}
              className={`${styles.chatItem} ${selectedChat?.id === chat.id ? styles.selected : ''}`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className={styles.chatAvatar}>
                <img
                  src={chat.avatar}
                  alt="Avatar"
                  onError={(e) => {
                    e.target.src = defaultAvatarImage;
                  }}
                />
              </div>
              <div className={styles.chatInfo}>
                <div className={styles.chatName}>
                  <span>{chat.name}</span>
                  <span>{chat.surname}</span>
                </div>
                <div className={styles.messageStatusText}>
                  {chat.messageStatus}
                </div>
              </div>
              <div className={styles.messageStatusIcon}>
                <MessageStatusIcon status={chat.messageStatus} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Детали чата */}
      <div className={styles.chatDetails}>
        {selectedChat ? (
          <>
            <div className={styles.chatHeader}>
              <img
                src={selectedChat.avatar}
                alt="Profile"
                className={styles.chatProfileImage}
                onError={(e) => {
                  e.target.src = defaultAvatarImage;
                }}
              />
              <div className={styles.chatProfileName}>
                <span>{selectedChat.name}</span>
                <span>{selectedChat.surname}</span>
              </div>
            </div>

            <div className={styles.chatMessagesContainer}>
              <div className={styles.messagesList}>
                {selectedChat.messages.map(message => (
                  <div
                    key={message.id}
                    className={`${styles.message} ${message.isOwn ? styles.own : styles.other}`}
                  >
                    <div className={styles.messageContent}>
                      <p>{message.text}</p>
                      <div className={styles.messageInfo}>
                        <span className={styles.messageTime}>
                          {message.timestamp}
                        </span>
                        {message.isOwn && (
                          <>
                            <span className={styles.messageStatus}>
                              {message.isRead ? 'Прочитано' : 'Отправлено'}
                            </span>
                            <button
                              className={styles.deleteMessage}
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className={styles.messageInputContainer}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className={styles.messageInput}
                />
                <button type="submit" className={styles.sendButton}>
                  <SendIcon />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.noChatSelected}>
            Выберите чат для просмотра
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, messageId: null })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default ChatListPage;