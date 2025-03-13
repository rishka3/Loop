// Header.jsx
import React, { useEffect, useState } from 'react';
import SearchIcon from '../../assets/icons/search.svg';
import { Link } from 'react-router-dom';
import defaultAvatarImage from '../../assets/images/default-avatar.png';
import { getUserById } from '../../mockData/testData';
import './Header.css';

function Header() {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Получаем данные текущего пользователя (ID 1)
        const user = getUserById(1);
        setCurrentUser(user);
    }, []);

    return (
        <header className="header">
            <div className="header-content">
                <div className="left-section">
                    <Link to="/" className="logo">Loop</Link>
                    <div className="search-container">
                        <span className="search-icon">
                            <img
                                src={SearchIcon}
                                alt="SearchIcon"
                                className="w-[50px] h-[40px]"
                            />
                        </span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Поиск"
                        />
                    </div>
                </div>
                <Link to="/profile" className="profile-icon">
                    <img
                        src={currentUser?.avatar || defaultAvatarImage}
                        alt="Profile"
                        onError={(e) => {
                            e.target.src = defaultAvatarImage;
                        }}
                    />
                </Link>
            </div>
        </header>
    );
}

export default Header;
