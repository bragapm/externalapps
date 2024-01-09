FROM ghcr.io/osgeo/gdal:alpine-normal-3.8.2

# Install Poetry
RUN wget -O - https://install.python-poetry.org | python3 - --version 1.6.1 && \
    rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.local/bin:$PATH"
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_VIRTUALENVS_CREATE=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

WORKDIR /app

ENV POETRY_VIRTUALENVS_CREATE=false
COPY pyproject.toml poetry.lock ./
RUN poetry install --without=dev --no-root && rm -rf $POETRY_CACHE_DIR

COPY . .
ENTRYPOINT ["poetry", "run", "dramatiq"]
CMD ["-p", "1", "-t", "2", "main"]
# T3 Micro has 2 vCPU ~ 2 processes
# T3 Micro has 1GB RAM ~ 2-4 threads is considered safe

