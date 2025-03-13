import React, { useState, useEffect, useRef } from 'react';
import EditProfileModal from '../../components/EditProfileModal/EditProfileModal';
import defaultAvatarImage from '../../assets/images/default-avatar.png';
import defaultPostImage from '../../assets/images/default-post.png';
import EditIcon from '../../assets/icons/edit.svg';
import PlusIcon from '../../assets/icons/plus.svg';

// Импорт тестовых данных
import { getUserById, getPostsByUserId, posts, categories } from '../../mockData/testData';

import styles from './UserProfilePage.module.css';

// Модальное окно создания поста
const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [postText, setPostText] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setPostImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = e => {
    e.stopPropagation();
    setPostImage(null);
    setImagePreview(null);
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({
      text: postText,
      image: postImage,
      categories: selectedCategories,
    });
    setPostText('');
    setPostImage(null);
    setImagePreview(null);
    setSelectedCategories([]);
  };

  const toggleCategory = category => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Создать пост</h3>

        <form onSubmit={handleSubmit} className={styles.createPostForm}>
          {/* Область для загрузки изображения */}
          <div
            className={`${styles.imageUploadArea} ${isDragging ? styles.dragging : ''} ${
              imagePreview ? styles.hasImage : ''
            }`}
            onClick={handleImageClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.hiddenFileInput}
            />

            {imagePreview ? (
              <div className={styles.imagePreviewContainer}>
                <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={styles.removeImageButton}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className={styles.uploadPrompt}>
                <div className={styles.uploadIcon}>📷</div>
                <p>Перетащите изображение сюда или кликните для выбора</p>
              </div>
            )}
          </div>

          {/* Текстовое поле */}
          <textarea
            value={postText}
            onChange={e => setPostText(e.target.value)}
            placeholder="Что у вас нового?"
            className={styles.postTextArea}
          />

          {/* Выпадающий список категорий */}
          <div className={styles.categoriesDropdown}>
            <button
              type="button"
              className={styles.dropdownToggle}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedCategories.length
                ? `Выбрано категорий: ${selectedCategories.length}`
                : 'Выберите категории'}
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {categories.map(category => (
                  <label key={category} className={styles.categoryOption}>
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className={styles.modalActions}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!postText.trim() && !postImage}
            >
              Опубликовать
            </button>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserProfilePage = () => {
  const currentUserId = 1; // ID текущего пользователя
  // Определяем состояния
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]); // Добавлено состояние для постов
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditProfile = updatedData => {
    // Здесь будет логика обновления данных пользователя
    console.log('Updated profile data:', updatedData);
  };

  useEffect(() => {
    // Получаем данные пользователя
    const userData = getUserById(currentUserId);
    setUser(userData);

    // Получаем посты пользователя с информацией о лайках и сортируем их по дате (новые сверху)
    const userPostsData = getPostsByUserId(currentUserId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(post => ({
        ...post,
        likes: post.likedBy.length,
        isLiked: post.likedBy.includes(currentUserId),
      }));
    setUserPosts(userPostsData);
  }, []);

  const formatDate = dateString => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const handleCreatePost = postData => {
    // Создание нового поста
    const newPost = {
      id: Date.now(),
      authorId: currentUserId,
      text: postData.text,
      image: postData.image ? URL.createObjectURL(postData.image) : null,
      categories: postData.categories,
      createdAt: new Date().toISOString(),
      likedBy: [],
    };

    // Добавляем пост в список постов пользователя
    setUserPosts(prevPosts => [newPost, ...prevPosts]);
    setIsModalOpen(false);
  };

  const handleLike = postId => {
    setUserPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const newLikedBy = post.isLiked
            ? post.likedBy.filter(id => id !== currentUserId)
            : [...post.likedBy, currentUserId];

          return {
            ...post,
            likedBy: newLikedBy,
            isLiked: !post.isLiked,
            likes: newLikedBy.length,
          };
        }
        return post;
      })
    );
  };

  if (!user) return null;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.leftSection}>
        {/* Информация о пользователе */}
        <div className={styles.userInfo}>
          <img
            src={user.avatar || defaultAvatarImage}
            alt="Profile"
            className={styles.userAvatar}
            onError={e => {
              e.target.src = defaultAvatarImage;
            }}
          />
          <div className={styles.userName}>
            <span>{user.firstName}</span>
            <span>{user.lastName}</span>
          </div>
          <button className={styles.editProfileButton} onClick={() => setIsEditModalOpen(true)}>
            <img src={EditIcon} alt="Edit profile" />
          </button>

          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={user}
            onSave={handleEditProfile}
          />
        </div>

        {/* Кнопка создания поста */}
        <button className={styles.createPostButton} onClick={() => setIsModalOpen(true)}>
          <img src={PlusIcon} alt="Create post" />
          <span>Создать пост</span>
        </button>

        {/* Посты пользователя */}
        <div className={styles.postsContainer}>
          {userPosts.map(post => (
            <article key={post.id} className={styles.post}>
              <div className={styles.postHeader}>
                <img
                  src={user.avatar || defaultAvatarImage}
                  alt="Avatar"
                  className={styles.authorAvatar}
                  onError={e => {
                    e.target.src = defaultAvatarImage;
                  }}
                />
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>
                    <span>{user.firstName}</span>
                    <span>{user.lastName}</span>
                  </div>
                  <div className={styles.postDate}>{formatDate(post.createdAt)}</div>
                </div>
              </div>

              {post.text && <p className={styles.postText}>{post.text}</p>}

              {post.image && (
                <div className={styles.postContent}>
                  <img
                    src={post.image || defaultPostImage}
                    alt="Post content"
                    className={styles.postImage}
                    onError={e => {
                      e.target.src = defaultPostImage;
                    }}
                  />
                  <div className={styles.postActions}>
                    <button
                      className={`${styles.likeButton} ${post.isLiked ? styles.liked : ''}`}
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

      {/* Правая секция (будет реализована позже) */}
      <div className={styles.rightSection}>{/* Тут будут категории выбраные пользователем */}</div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default UserProfilePage;
