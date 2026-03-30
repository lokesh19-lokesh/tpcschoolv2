/**
 * Pick My School - Canvas Editor Engine
 * Handles interactive design surface, dragging, text editing, and image export.
 */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('design-canvas');
    if (!canvas) return;

    const toolbar = document.querySelector('.canvas-toolbar');
    const tools = {
        pointer: document.getElementById('tool-pointer'),
        text: document.getElementById('tool-text'),
        image: document.getElementById('tool-image'),
        shape: document.getElementById('tool-shape'),
        download: document.getElementById('tool-download')
    };

    let currentTool = 'pointer';
    let selectedElement = null;
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    // --- Tool Management ---
    function setTool(toolId) {
        currentTool = toolId;
        // Update UI
        Object.values(tools).forEach(btn => btn.classList.remove('active'));
        if (tools[toolId]) tools[toolId].classList.add('active');
        
        // Update Canvas state
        document.querySelector('.canvas-app-window').setAttribute('data-tool', toolId);
        
        // Clear selection if not in pointer mode
        if (toolId !== 'pointer') {
            deselectAll();
        }
    }

    Object.keys(tools).forEach(toolId => {
        if (toolId === 'download') return; // Handled separately
        tools[toolId].addEventListener('click', () => setTool(toolId));
    });

    // --- Selection & Dragging ---
    canvas.addEventListener('mousedown', (e) => {
        const element = e.target.closest('.canvas-element');
        
        // Tool-specific clicks on the canvas background
        if (!element && e.target === canvas) {
            if (currentTool === 'text') addTextElement(e.offsetX, e.offsetY);
            if (currentTool === 'shape') addShapeElement(e.offsetX, e.offsetY);
            if (currentTool === 'image') addImageElement(e.offsetX, e.offsetY);
            deselectAll();
            return;
        }

        if (element && currentTool === 'pointer') {
            selectElement(element);
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = parseInt(element.style.left) || 0;
            initialTop = parseInt(element.style.top) || 0;
            
            // Bring to front
            canvas.appendChild(element);
            
            // Prevent text selection while dragging
            e.preventDefault();
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || !selectedElement) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        selectedElement.style.left = `${initialLeft + dx}px`;
        selectedElement.style.top = `${initialTop + dy}px`;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    function selectElement(el) {
        deselectAll();
        selectedElement = el;
        el.classList.add('selected');
        
        // Enable content editing if it's text
        const textNode = el.querySelector('.editable-text');
        if (textNode) {
            textNode.setAttribute('contenteditable', 'true');
        }
    }

    function deselectAll() {
        document.querySelectorAll('.canvas-element').forEach(el => {
            el.classList.remove('selected');
            const textNode = el.querySelector('.editable-text');
            if (textNode) textNode.removeAttribute('contenteditable');
        });
        selectedElement = null;
    }

    // --- Element Creation ---
    function addTextElement(x, y) {
        const div = document.createElement('div');
        div.className = 'canvas-element';
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.innerHTML = `<h3 class="editable-text">New Text</h3>`;
        canvas.appendChild(div);
        selectElement(div);
        setTool('pointer');
    }

    function addShapeElement(x, y) {
        const div = document.createElement('div');
        div.className = 'canvas-element';
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.style.width = '100px';
        div.style.height = '100px';
        div.style.backgroundColor = '#d12924';
        div.style.borderRadius = '8px';
        div.style.opacity = '0.5';
        canvas.appendChild(div);
        selectElement(div);
        setTool('pointer');
    }

    function addImageElement(x, y) {
        // For simulation, just add a placeholder logo
        const div = document.createElement('div');
        div.className = 'canvas-element';
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.style.width = '80px';
        div.innerHTML = `<img src="assets/img/logo2.png" alt="Logo" width="100%">`;
        canvas.appendChild(div);
        selectElement(div);
        setTool('pointer');
    }

    // --- Download Functionality ---
    tools.download.addEventListener('click', () => {
        const btn = tools.download;
        const originalContent = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        deselectAll(); // Hide selection borders in the export

        html2canvas(canvas, {
            useCORS: true,
            scale: 2, // Higher quality
            backgroundColor: '#ffffff'
        }).then(resultCanvas => {
            const link = document.createElement('a');
            link.download = 'school-poster.png';
            link.href = resultCanvas.toDataURL('image/png');
            link.click();
            
            btn.innerHTML = originalContent;
            alert('Your design has been exported successfully!');
        }).catch(err => {
            console.error('Export failed:', err);
            btn.innerHTML = originalContent;
            alert('Export failed. Please try again.');
        });
    });

    // Keyboard support for deleting elements
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (selectedElement && !e.target.hasAttribute('contenteditable')) {
                selectedElement.remove();
                selectedElement = null;
            }
        }
    });
});
