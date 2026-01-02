"""Shared fixtures for integration tests."""

from __future__ import annotations

import subprocess
import time
from contextlib import asynccontextmanager
from typing import TYPE_CHECKING

import pytest
from mcp import ClientSession, StdioServerParameters
from mcp.client.sse import sse_client
from mcp.client.stdio import stdio_client
from mcp.client.streamable_http import streamable_http_client

if TYPE_CHECKING:
    from collections.abc import AsyncGenerator


@pytest.fixture
def stdio_session():
    """Return async context manager for an MCP client session connected via stdio."""

    @asynccontextmanager
    async def _session() -> AsyncGenerator[ClientSession]:
        server_params = StdioServerParameters(
            command="uv",
            args=["run", "mcp-test-kits"],
        )
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                yield session

    return _session()


@pytest.fixture
def http_server():
    """Start HTTP server and return base URL."""
    proc = subprocess.Popen(
        ["uv", "run", "mcp-test-kits", "--transport", "http", "--port", "3001"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    # Wait for server to start
    time.sleep(2)
    yield "http://localhost:3001"
    proc.terminate()
    proc.wait()


@pytest.fixture
def sse_server():
    """Start SSE server and return base URL."""
    proc = subprocess.Popen(
        ["uv", "run", "mcp-test-kits", "--transport", "sse", "--port", "3002"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    # Wait for server to start
    time.sleep(2)
    yield "http://localhost:3002"
    proc.terminate()
    proc.wait()


@pytest.fixture
def http_session(http_server):
    """Return async context manager for an MCP client session connected via HTTP."""

    @asynccontextmanager
    async def _session() -> AsyncGenerator[ClientSession]:
        async with streamable_http_client(f"{http_server}/mcp") as (read, write, _):
            async with ClientSession(read, write) as session:
                await session.initialize()
                yield session

    return _session()


@pytest.fixture
def sse_session(sse_server):
    """Return async context manager for an MCP client session connected via SSE."""

    @asynccontextmanager
    async def _session() -> AsyncGenerator[ClientSession]:
        async with sse_client(f"{sse_server}/sse") as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                yield session

    return _session()
