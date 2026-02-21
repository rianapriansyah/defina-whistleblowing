import React from 'react';

export const Home: React.FC = () => {
    return (
        <div className="home-container">
            <header className="home-header">
                <h1>Selamat Datang di Defina Whistleblowing</h1>
                <p>Laporkan kekhawatiran secara aman dan rahasia</p>
            </header>
            
            <main className="home-main">
                <section className="hero">
                    <p>Platform ini menyediakan saluran aman bagi karyawan dan pemangku kepentingan untuk melaporkan aktivitas yang tidak etis atau ilegal.</p>
                </section>

                <section className="features">
                    <div className="feature-card">
                        <h3>Rahasia</h3>
                        <p>Identitas Anda dilindungi</p>
                    </div>
                    <div className="feature-card">
                        <h3>Aman</h3>
                        <p>Komunikasi terenkripsi</p>
                    </div>
                    <div className="feature-card">
                        <h3>Mudah Diakses</h3>
                        <p>Berbagai saluran pelaporan tersedia</p>
                    </div>
                </section>

                <section className="cta">
                    <button className="btn-primary">Laporkan Masalah</button>
                </section>
            </main>
        </div>
    );
};

export default Home;