import requests
import os
import time
import matplotlib.pyplot as plt
import numpy as np

# Cargar el token de solo lectura para acceder a repos privados
GITHUB_TOKEN = os.getenv("PAT_GITHUB_PRIVATE")  
USERNAME = "Iskandar1412"

# Configurar la cabecera de autenticación para GitHub API
headers = {"Authorization": f"token {GITHUB_TOKEN}"}

# Obtener lista de repositorios (incluyendo privados)
repos_url = "https://api.github.com/user/repos?per_page=100&visibility=all"
repos = requests.get(repos_url, headers=headers).json()

# Diccionario para contar bytes por lenguaje
language_stats = {}

for repo in repos:
    languages_url = repo.get("languages_url", "")
    if languages_url:
        languages_data = requests.get(languages_url, headers=headers).json()
        for lang, bytes_used in languages_data.items():
            language_stats[lang] = language_stats.get(lang, 0) + bytes_used

# Calcular porcentaje de uso
total_bytes = sum(language_stats.values())
language_percentages = {
    lang: round((bytes_used / total_bytes) * 100, 4)
    for lang, bytes_used in language_stats.items()
}

# Ordenar de mayor a menor
sorted_languages = sorted(language_percentages.items(), key=lambda x: x[1], reverse=True)

#---------------------------------------------
def generate_language_chart(data):
    languages = [lang for lang, _ in data]
    percentages = [percent for _, percent in data]

    fig, ax = plt.subplots(figsize=(10, 6))
    y_pos = np.arange(len(languages))

    # Colores personalizados
    colors = plt.cm.viridis(np.linspace(0.2, 1, len(languages)))

    ax.barh(y_pos, percentages, color=colors, align="center")
    ax.set_yticks(y_pos)
    ax.set_yticklabels(languages)
    ax.invert_yaxis()
    ax.set_xlabel("Porcentaje de Uso (%)")

    for i, v in enumerate(percentages):
        ax.text(v + 1, i, f"{v}%", va="center", fontsize=10)

    # Guardar la imagen
    plt.savefig("scripts/languages.png", bbox_inches="tight", dpi=300)
    plt.close(fig)
    print("✅ Imagen `languages.png` generada correctamente.")

# Generar la imagen si hay datos
if sorted_languages:
    generate_language_chart(sorted_languages)
#---------------------------------------------

# Leer el README actual
readme_path = "README.md"
with open(readme_path, "r", encoding="utf-8") as file:
    readme_content = file.readlines()

# Identificar la sección a actualizar
start_marker = "<!-- LANGUAGES-START -->\n"
end_marker = "<!-- LANGUAGES-END -->\n"

if start_marker in readme_content and end_marker in readme_content:
    start_index = readme_content.index(start_marker) + 1
    end_index = readme_content.index(end_marker)
else:
    print("⚠️ No se encontraron los marcadores en el README. Verifica que estén presentes.")
    exit(1)

new_table = [
    "## 📊 Lenguajes Usados\n",
    "![Lenguajes más usados](./scripts/languages.png)\n"
]

# Agregar un timestamp para asegurar cambios en `git`
timestamp = f"\n<!-- Última actualización: {time.strftime('%Y-%m-%d %H:%M:%S UTC')} -->\n"
new_table.append(timestamp)

# Mostrar la nueva tabla generada antes de escribirla
print("📊 Nueva tabla generada en README.md:")
for line in new_table:
    print(line.strip())

# Reemplazar la sección en el README
updated_readme = readme_content[:start_index] + new_table + readme_content[end_index:]

# Verificar si realmente hay un cambio en el contenido
new_content = "".join(updated_readme)

if new_content == "".join(readme_content):
    print("✅ No se detectaron cambios en README.md. No es necesario actualizar.")
    exit(0)  # No genera un commit si no hay cambios

# Guardar el archivo solo si hay cambios
with open(readme_path, "w", encoding="utf-8") as file:
    file.writelines(updated_readme)

print("✅ README.md actualizado correctamente.")