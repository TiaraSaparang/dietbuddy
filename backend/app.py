import streamlit as st
from pathlib import Path

st.set_page_config(
    page_title="DietBuddy — Progres UTS (35%)",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# Membaca dan menampilkan antarmuka web DietBuddy (Progres UTS 35%)
html_path = Path(__file__).parent / "index.html"
if html_path.exists():
    html_content = html_path.read_text(encoding="utf-8")
    st.components.v1.html(html_content, height=920, scrolling=True)
else:
    st.error("File index.html tidak ditemukan.")
