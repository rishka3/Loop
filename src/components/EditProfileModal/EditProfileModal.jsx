import React, { useState, useRef } from 'react';
import styles from './EditProfileModal.module.css';
import { categories } from '../../mockData/testData';

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
  const [profileImage, setProfileImage] = useState(user.avatar);
  const [imagePreview, setImagePreview] = useState(user.avatar);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [login, setLogin] = useState(user.login);
  const [password, setPassword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(user.categories || []);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddCategory = (category) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setSelectedCategories(selectedCategories.filter(category => category !== categoryToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      avatar: profileImage,
      firstName,
      lastName,
      login,
      password,
      categories: selectedCategories
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.imageSection}>
          <div
            className={`${styles.imageUpload} ${isDragging ? styles.dragging : ''}`}
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
              className={styles.hiddenInput}
            />
            <img
              src={imagePreview}
              alt="Profile"
              className={styles.profileImage}
            />
          </div>
          <span className={styles.changePhotoText}>Изменить фотографию</span>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.personalData}>
            <h3 className={styles.sectionTitle}>Личные данные</h3>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Имя"
              className={styles.input}
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Фамилия"
              className={styles.input}
            />
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Логин"
              className={styles.input}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className={styles.input}
            />
          </div>

          <div className={styles.categories}>
            <h3 className={styles.sectionTitle}>Категории</h3>
            <select
              className={styles.categorySelect}
              onChange={(e) => handleAddCategory(e.target.value)}
              value=""
            >
              <option value="" disabled>Выбрать категории</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <div className={styles.selectedCategories}>
              {selectedCategories.map(category => (
                <div key={category} className={styles.categoryTag}>
                  {category}
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className={styles.removeCategory}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} className={styles.saveButton}>
          Сохранить
        </button>
      </div>
    </div>
  );
};

export default EditProfileModal;
