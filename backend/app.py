from flask import Flask, request, jsonify
import wikipediaapi
import textwrap
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import matplotlib.pyplot as plt
import io
import base64
from gensim.corpora.dictionary import Dictionary
from gensim.models import LdaModel
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from wordcloud import WordCloud
import seaborn as sns
from collections import Counter
import numpy as np
import re
from flask_cors import CORS
from nltk.util import ngrams


app = Flask(__name__)
CORS(app)  


your_api_key = "AIzaSyAu2gs4W157wTwXpEB8rUItEYFzSgJ86dI"
genai.configure(api_key=your_api_key)
OMDB_API_URL = "http://www.omdbapi.com/"
OMDB_API_KEY = "483f1f26" 
nltk.download('vader_lexicon')

sia = SentimentIntensityAnalyzer()

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('vader_lexicon')

user_agent = "MyWikiCrawler/1.0 (01fe21bcs216@kletech.ac.in)"
wiki = wikipediaapi.Wikipedia('en', extract_format=wikipediaapi.ExtractFormat.WIKI, headers={'User-Agent': user_agent})


@app.route('/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello, World!"}), 200


@app.route('/api/movie-plot', methods=['GET'])
def fetch_movie_plot():
    movie_title = request.args.get('movie_title', default='3 Idiots', type=str)
    page = wiki.page(movie_title)

    if not page.exists():
        return jsonify({'error': f"'{movie_title}' not found on Wikipedia."}), 404

    plot = None
    for section in page.sections:
        if 'plot' in section.title.lower():
            plot = section.text
            break

    if plot:
        wrapped_plot = "\n".join(textwrap.wrap(plot, width=80))
        return jsonify({'movie_title': movie_title, 'plot': wrapped_plot}), 200
    else:
        return jsonify({'error': f"Plot section not found for '{movie_title}'."}), 404


@app.route('/api/infobox', methods=['GET'])
def fetch_infobox_data():
    movie_title = request.args.get('movie_title', default='3 Idiots', type=str)
    base_url = "https://en.wikipedia.org/wiki/"
    movie_title_encoded = movie_title.replace(" ", "_")
    url = base_url + movie_title_encoded

    try:
        response = requests.get(url, headers={'User-Agent': user_agent})
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Error fetching page: {e}'}), 500

    soup = BeautifulSoup(response.text, "html.parser")
    infobox = soup.find("table", {"class": "infobox vevent"})

    if not infobox:
        return jsonify({'error': f"Infobox not found for '{movie_title}' on Wikipedia."}), 404

    result = []
    for row in infobox.find_all("tr"):
        header = row.find("th")
        value = row.find("td")

        if header and value:
            key = header.text.strip()
            val = value.text.strip()
            result.append(f"{key}: {val}")

    if result:
        return jsonify({'movie_title': movie_title, 'infobox': result}), 200
    else:
        return jsonify({'error': f"No key-value pairs found in the infobox for '{movie_title}'."}), 404


@app.route('/generate_movie_lessons', methods=['POST'])
def generate_movie_lessons():
    try:
        data = request.get_json()
        movie_title = data.get('movie_title', '')

        if not movie_title:
            return jsonify({"error": "Movie title is required"}), 400

        prompt = f"List 2-3 life lessons or messages conveyed in the movie '{movie_title}' in bullet points."

        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(prompt)

        lessons_and_descriptions = response.text.strip().split('\n')

        wrapped_output = "\n\n".join([textwrap.fill(lesson, width=90) for lesson in lessons_and_descriptions])

        return jsonify({"movie_title": movie_title, "life_lessons": wrapped_output})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



def get_youtube_links_from_wikipedia_topic(topic):
    formatted_topic = topic.replace(" ", "_")
    wikipedia_url = f"https://en.wikipedia.org/wiki/{formatted_topic}"
    
    response = requests.get(wikipedia_url)
    if response.status_code != 200:
        return {"error": f"Failed to retrieve the page. HTTP Status Code: {response.status_code}"}

    soup = BeautifulSoup(response.text, "html.parser")

    external_links_section = soup.find(id="External_links")
    youtube_links = []

    if external_links_section:
        for link in external_links_section.find_next("ul").find_all("a", href=True):
            href = link['href']
            if "youtube.com" in href or "youtu.be" in href:
                youtube_links.append(href)

    return {"youtube_links": youtube_links}

@app.route('/get_youtube_links', methods=['POST'])
def get_youtube_links():
    try:
        data = request.get_json()
        topic = data.get("topic")

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        result = get_youtube_links_from_wikipedia_topic(topic)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

analyzer = SentimentIntensityAnalyzer()



@app.route('/generate_sentiments', methods=['POST'])
def generate_sentiments():
    try:
        data = request.get_json()
        movie_title = data.get("movie_title")

        if not movie_title:
            return jsonify({"error": "Movie title is required"}), 400

        prompt = f"List 5 general sentiment words for the movie '{movie_title}' without detailed descriptions."

        
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(prompt)

        sentiment_words = response.text.strip().split(",")
        sentiment_words_cleaned = [word.strip() for word in sentiment_words]

        return jsonify({"movie_title": movie_title, "sentiment_words": sentiment_words_cleaned})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_movie_details', methods=['POST'])
def get_movie_details():
    try:
        data = request.get_json()
        movie_title = data.get("movie_title")

        if not movie_title:
            return jsonify({"error": "Movie title is required"}), 400

        params = {
            't': movie_title,
            'apikey': OMDB_API_KEY,
            'plot': 'short',  
            'r': 'json',  
        }

        response = requests.get(OMDB_API_URL, params=params)
        movie_data = response.json()

        if movie_data.get('Response') == 'True':
            movie_details = {
                "Title": movie_data.get("Title"),
                "Year": movie_data.get("Year"),
                "Rated": movie_data.get("Rated"),
                "Released": movie_data.get("Released"),
                "Runtime": movie_data.get("Runtime"),
                "Genre": movie_data.get("Genre"),
                "Director": movie_data.get("Director"),
                "Writer": movie_data.get("Writer"),
                "Actors": movie_data.get("Actors"),
                "Language": movie_data.get("Language"),
                "Country": movie_data.get("Country"),
                "Awards": movie_data.get("Awards"),
                "Poster": movie_data.get("Poster"),
                "Metascore": movie_data.get("Metascore"),
                "IMDb Rating": movie_data.get("imdbRating"),
                "IMDb Votes": movie_data.get("imdbVotes"),
                "Type": movie_data.get("Type"),
            }

            plot_text = movie_data.get('Plot')
            wrapped_plot = textwrap.fill(plot_text, width=95)
            movie_details["Plot"] = wrapped_plot

            return jsonify(movie_details)

        else:
            return jsonify({"error": movie_data.get('Error')}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/suggest_movies', methods=['POST'])
def suggest_movies():
    try:
        # Get the movie title from the request JSON
        data = request.get_json()
        movie_title = data.get("movie_title")

        if not movie_title:
            return jsonify({"error": "Movie title is required"}), 400

        # Generate the prompt based on sentiment and themes
        prompt = f"Based on the sentiment and themes of the movie '{movie_title}', list 5 similar movies that the user might enjoy, considering emotional tone, genre, and overall storyline, without detailed descriptions."

        # Generate movie suggestions using the Gemini model
        model = genai.GenerativeModel("gemini-1.5-flash-latest")
        response = model.generate_content(prompt)

        # Extract and clean the movie suggestions from the response
        suggested_titles = response.text.strip().split("\n")
        suggested_titles = [title.strip() for title in suggested_titles]

        # Return the movie suggestions as JSON
        return jsonify({"suggested_movies": suggested_titles})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_sentiment', methods=['POST'])
def analyze_sentiment():
    try:
        # Get the plot summary from the request JSON
        data = request.get_json()
        plot_summary = data.get("plot_summary")

        if not plot_summary:
            return jsonify({"error": "Plot summary is required"}), 400

        # Break the plot into chunks for sentiment analysis
        plot_chunks = textwrap.wrap(plot_summary, width=300)  # Adjust width to control chunk size
        sentiment_scores = []

        # Analyze sentiment for each chunk
        for chunk in plot_chunks:
            score = sia.polarity_scores(chunk)
            sentiment_scores.append(score)

        # Extract sentiment components for visualization
        positive_scores = [score['pos'] for score in sentiment_scores]
        negative_scores = [score['neg'] for score in sentiment_scores]
        neutral_scores = [score['neu'] for score in sentiment_scores]
        compound_scores = [score['compound'] for score in sentiment_scores]

        # Plotting sentiment trend
        plt.figure(figsize=(10, 6))
        plt.plot(positive_scores, label='Positive', color='g')
        plt.plot(negative_scores, label='Negative', color='r')
        plt.plot(neutral_scores, label='Neutral', color='b')
        plt.plot(compound_scores, label='Compound', color='purple')
        plt.xlabel("Plot Chunk")
        plt.ylabel("Sentiment Score")
        plt.title("Sentiment Trend Across Plot")
        plt.legend()

        # Save the figure to a bytes buffer
        sentiment_trend_img = io.BytesIO()
        plt.savefig(sentiment_trend_img, format='png')
        sentiment_trend_img.seek(0)
        sentiment_trend_base64 = base64.b64encode(sentiment_trend_img.read()).decode('utf-8')

        # Calculate overall sentiment distribution
        overall_pos = sum(positive_scores) / len(positive_scores)
        overall_neg = sum(negative_scores) / len(negative_scores)
        overall_neu = sum(neutral_scores) / len(neutral_scores)

        # Plotting overall sentiment distribution
        plt.figure(figsize=(6, 6))
        labels = ['Positive', 'Negative', 'Neutral']
        sizes = [overall_pos, overall_neg, overall_neu]
        colors = ['g', 'r', 'b']
        plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=140)
        plt.title("Overall Sentiment Distribution")

        # Save the pie chart to a bytes buffer
        overall_sentiment_img = io.BytesIO()
        plt.savefig(overall_sentiment_img, format='png')
        overall_sentiment_img.seek(0)
        overall_sentiment_base64 = base64.b64encode(overall_sentiment_img.read()).decode('utf-8')

        # Return sentiment analysis and images as a response
        return jsonify({
            "sentiment_trend_img": sentiment_trend_base64,
            "overall_sentiment_img": overall_sentiment_base64,
            "sentiment_scores": sentiment_scores
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/analyze_topics', methods=['POST'])
def analyze_topics():
    try:
        # Get the plot summary from the request JSON
        data = request.get_json()
        plot_summary = data.get("plot_summary")

        if not plot_summary:
            return jsonify({"error": "Plot summary is required"}), 400

        # Preprocessing: Tokenization and stop word removal
        stop_words = set(stopwords.words('english'))
        tokens = [word for word in word_tokenize(plot_summary.lower()) if word.isalpha() and word not in stop_words]

        # Prepare data for LDA
        plot_dictionary = Dictionary([tokens])
        plot_corpus = [plot_dictionary.doc2bow(tokens)]

        # Train LDA model
        num_topics = 3  # You can adjust the number of topics based on your needs
        lda_model = LdaModel(plot_corpus, num_topics=num_topics, id2word=plot_dictionary, passes=10)

        # Display topics
        topics = lda_model.show_topics(formatted=False)
        
        # Convert the topics to regular Python float types
        topic_keywords = {
            f'Topic {i+1}': {word: float(weight) for word, weight in words}
            for i, (_, words) in enumerate(topics)
        }

        # Plotting topic distribution as a bar chart
        plt.figure(figsize=(10, 6))
        for i, (topic, keywords) in enumerate(topic_keywords.items()):
            plt.barh(list(keywords.keys()), list(keywords.values()), label=topic)
        plt.xlabel('Weight')
        plt.title('Key Themes in Movie Plot')
        plt.legend()

        topic_dist_img = io.BytesIO()
        plt.savefig(topic_dist_img, format='png')
        topic_dist_img.seek(0)
        topic_dist_base64 = base64.b64encode(topic_dist_img.read()).decode('utf-8')

        wordcloud_images = []
        for i, (topic, keywords) in enumerate(topic_keywords.items()):
            wordcloud = WordCloud(width=800, height=400, background_color='white').generate_from_frequencies(keywords)
            plt.figure(figsize=(8, 4))
            plt.imshow(wordcloud, interpolation='bilinear')
            plt.axis('off')
            plt.title(f'Word Cloud for {topic}')

            wordcloud_img = io.BytesIO()
            plt.savefig(wordcloud_img, format='png')
            wordcloud_img.seek(0)
            wordcloud_base64 = base64.b64encode(wordcloud_img.read()).decode('utf-8')
            wordcloud_images.append(wordcloud_base64)

        return jsonify({
            "topic_distribution_img": topic_dist_base64,
            "wordcloud_images": wordcloud_images,
            "topic_keywords": topic_keywords
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500





def preprocess_text(text):
    words = nltk.word_tokenize(text.lower())
    
    
    stop_words = set(stopwords.words('english'))
    filtered_words = [word for word in words if word.isalnum() and word not in stop_words]
    
    return filtered_words

def word_frequency_analysis(plot_text):
    filtered_words = preprocess_text(plot_text)
    word_counts = Counter(filtered_words)
    common_words = word_counts.most_common(10)

    if not common_words:
        return None

    words, counts = zip(*common_words)

    words = list(words)
    counts = list(counts)

    plt.figure(figsize=(8, 6))
    sns.barplot(x=words, y=counts)
    plt.title("Most Common Words")
    plt.xlabel("Words")
    plt.ylabel("Frequency")
    plt.xticks(rotation=45)

    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    return base64.b64encode(img.read()).decode('utf-8')

def bigram_trigram_analysis(plot_text):
    filtered_words = preprocess_text(plot_text)

    bigrams = list(ngrams(filtered_words, 2))
    trigrams = list(ngrams(filtered_words, 3))

    bigram_freq = Counter(bigrams).most_common(10)
    trigram_freq = Counter(trigrams).most_common(10)

    bigrams_list = [' '.join(bigram) for bigram, _ in bigram_freq]
    bigram_counts = [count for _, count in bigram_freq]

    plt.figure(figsize=(8, 6))
    sns.barplot(x=bigrams_list, y=bigram_counts)
    plt.title("Most Common Bigrams")
    plt.xlabel("Bigram")
    plt.ylabel("Frequency")
    plt.xticks(rotation=45)

    img_bigram = io.BytesIO()
    plt.savefig(img_bigram, format='png')
    img_bigram.seek(0)

    trigrams_list = [' '.join(trigram) for trigram, _ in trigram_freq]
    trigram_counts = [count for _, count in trigram_freq]

    plt.figure(figsize=(8, 6))
    sns.barplot(x=trigrams_list, y=trigram_counts)
    plt.title("Most Common Trigrams")
    plt.xlabel("Trigram")
    plt.ylabel("Frequency")
    plt.xticks(rotation=45)

    img_trigram = io.BytesIO()
    plt.savefig(img_trigram, format='png')
    img_trigram.seek(0)

    return {
        'bigram_image': base64.b64encode(img_bigram.read()).decode('utf-8'),
        'trigram_image': base64.b64encode(img_trigram.read()).decode('utf-8')
    }

def emotion_detection(plot_text):
    sia = SentimentIntensityAnalyzer()
    sentences = nltk.sent_tokenize(plot_text)
    emotions = {'positive': 0, 'negative': 0, 'neutral': 0}

    for sentence in sentences:
        score = sia.polarity_scores(sentence)
        if score['compound'] > 0.1:
            emotions['positive'] += 1
        elif score['compound'] < -0.1:
            emotions['negative'] += 1
        else:
            emotions['neutral'] += 1

    labels = list(emotions.keys())
    values = list(emotions.values())

    plt.figure(figsize=(8, 6))
    plt.bar(labels, values)
    plt.title("Emotion Breakdown in Plot")
    plt.xlabel("Emotion")
    plt.ylabel("Frequency")

    img_emotion = io.BytesIO()
    plt.savefig(img_emotion, format='png')
    img_emotion.seek(0)
    return base64.b64encode(img_emotion.read()).decode('utf-8')


@app.route('/analyze_plot', methods=['POST'])
def analyze_plot():
    try:
     
        data = request.get_json()
        plot_summary = data.get("plot_summary")

        if not plot_summary:
            return jsonify({"error": "Plot summary is required"}), 400

        word_freq_img = word_frequency_analysis(plot_summary)
        bigram_trigram_images = bigram_trigram_analysis(plot_summary)
        emotion_img = emotion_detection(plot_summary)

        return jsonify({
            "word_frequency_image": word_freq_img,
            "bigram_image": bigram_trigram_images['bigram_image'],
            "trigram_image": bigram_trigram_images['trigram_image'],
            "emotion_image": emotion_img
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route for generating movie plot interpretation (updated to '/generate_interpretation')
@app.route('/generate_interpretation', methods=['POST'])
def generate_movie_interpretation():
    data = request.get_json()
    movie_title = data.get('movie_title')

    if not movie_title:
        return jsonify({'error': 'Movie title is required'}), 400

    prompt = (
        f"Provide a concise yet comprehensive interpretation of the movie plot for "
        f"'{movie_title}'. Highlight the main themes, character motivations, key turning "
        f"points, and the overall message or impact of the story. Make it insightful and "
        f"engaging for readers, summarizing the movie's core elements and emotional depth."
    )

    model = genai.GenerativeModel("gemini-1.5-flash-latest")  
    response = model.generate_content(prompt)

    wrapped_text = textwrap.fill(response.text, width=80)
    
    return jsonify({'plot_summary': wrapped_text})

# Route for generating movie themes
@app.route('/generate_themes', methods=['POST'])
def generate_movie_themes():
    data = request.get_json()
    movie_title = data.get('movie_title')

    if not movie_title:
        return jsonify({'error': 'Movie title is required'}), 400

    prompt = f"List the 2-3 primary themes of the movie '{movie_title}' in bullet points, with each theme on a single line followed by a brief description."

    model = genai.GenerativeModel("gemini-1.5-flash-latest")
    response = model.generate_content(prompt)

    themes_and_descriptions = [
        f"{theme.strip()} - {description.strip()}"
        for theme, description in zip(response.text.split("*")[::2], response.text.split("*")[1::2])
    ]

    return jsonify({'themes': themes_and_descriptions})  # Return an array of themes

if __name__ == '__main__':
    app.run(debug=True)
