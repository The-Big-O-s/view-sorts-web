import heapq
from collections import Counter
from dataclasses import dataclass
from typing import Optional

@dataclass
class Node:
    frequency: int
    char: Optional[str] = None # solo las hojas tienen carácter
    left: Optional["Node"] = None
    right: Optional["Node"] = None

    def is_leaf(self) -> bool:
        return self.char is not None

def count_frequencies(text: str) -> dict[str, int]:
    return dict(Counter(text))

def build_tree(frequencies: dict[str, int]) -> Node:
    if not frequencies:
        raise ValueError("No hay símbolos para construir el árbol")

    # El heap compara (frecuencia, orden). El orden desempata y evita comparar nodos.
    # Las hojas se insertan ordenadas por carácter para que el árbol sea siempre
    # el mismo a partir de las mismas frecuencias (lo necesita el descompresor).
    heap = []
    order = 0
    for char in sorted(frequencies):
        heapq.heappush(heap, (frequencies[char], order, Node(frequencies[char], char)))
        order += 1

    if len(heap) == 1:
        freq, _, leaf = heap[0]
        return Node(freq, left=leaf)

    # Unir siempre los dos mínimos hasta que quede un solo nod
    while len(heap) > 1:
        freq_a, _, a = heapq.heappop(heap)
        freq_b, _, b = heapq.heappop(heap)
        heapq.heappush(heap, (freq_a + freq_b, order, Node(freq_a + freq_b, left=a, right=b)))
        order += 1

    return heap[0][2]

def build_codes(root: Node) -> dict[str, str]:
    codes = {}

    def walk(node: Optional[Node], path: str):
        if node is None:
            return
        if node.is_leaf():
            codes[node.char] = path
            return
        walk(node.left, path + "0") # izquierda = 0
        walk(node.right, path + "1") # derecha = 1

    walk(root, "")
    return codes

def tree_to_dict(node: Node) -> dict:
    # Árbol en formato JSON para que el front lo dibuje
    if node.is_leaf():
        return {"char": node.char, "frequency": node.frequency}

    result = {"frequency": node.frequency}
    if node.left:
        result["left"] = tree_to_dict(node.left)
    if node.right:
        result["right"] = tree_to_dict(node.right)
    return result