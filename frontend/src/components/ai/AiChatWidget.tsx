import {useEffect, useMemo, useRef, useState} from "react"
import type {FormEvent} from "react"
import {Bot, MessageCircle, Send, X} from "lucide-react"
import {askAiChat} from "../../api/aiApi"
import {getProducts} from "../../api/productApi"
import type {Product} from "../../types/product"
import {buildAiChatContext} from "../../utils/aiChatContext"

type ChatRole = "assistant" | "user"

type ChatMessage = {
    id: string
    role: ChatRole
    content: string
}

const SUGGESTED_PROMPTS = [
    "Chinh sach bao hanh cua shop la gi?",
    "Co laptop nao gia tot trong tam 20 trieu?",
    "Phi ship va thoi gian giao hang nhu the nao?",
]

const WELCOME_MESSAGE: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content:
        "Xin chao! Minh la tro ly NovaGear. Ban co the hoi minh ve san pham, gia ca, chinh sach bao hanh, giao hang va thanh toan.",
}

function createMessage(role: ChatRole, content: string): ChatMessage {
    return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role,
        content,
    }
}

function buildConversationContext(messages: ChatMessage[]): string[] {
    return messages.slice(-6).map((message) => {
        const label = message.role === "user" ? "User" : "Assistant"
        return `${label}: ${message.content.slice(0, 280)}`
    })
}

export default function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
    const [products, setProducts] = useState<Product[]>([])
    const messageEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        let cancelled = false

        getProducts()
            .then((items) => {
                if (!cancelled) {
                    setProducts(items)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setProducts([])
                }
            })

        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages, isSending, isOpen])

    const baseContext = useMemo(() => buildAiChatContext(products), [products])

    const sendQuestion = async (questionInput?: string) => {
        const question = (questionInput ?? input).trim()
        if (!question || isSending) {
            return
        }

        const nextUserMessage = createMessage("user", question)
        const historyWithQuestion = [...messages, nextUserMessage]

        setInput("")
        setMessages(historyWithQuestion)
        setIsSending(true)

        try {
            const response = await askAiChat(question, {
                context: [...baseContext, ...buildConversationContext(historyWithQuestion)],
                topK: 5,
            })

            const sourceLines = response.sources.slice(0, 3).map((source) => `- ${source.title}`)
            const answer = sourceLines.length > 0
                ? `${response.answer}\n\nNguon tham khao:\n${sourceLines.join("\n")}`
                : response.answer

            setMessages((prev) => [...prev, createMessage("assistant", answer)])
        } catch {
            setMessages((prev) => [
                ...prev,
                createMessage(
                    "assistant",
                    "Minh tam thoi khong lay duoc du lieu AI. Ban thu lai sau hoac xem trang /products va /policies de tham khao nhanh."
                ),
            ])
        } finally {
            setIsSending(false)
        }
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        await sendQuestion()
    }

    return (
        <div className="fixed bottom-5 right-5 z-[70]">
            {isOpen ? (
                <div className="flex h-[560px] w-[360px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-4 py-3 text-white">
                        <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4"/>
                            <p className="text-sm font-semibold">Tro ly NovaGear</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
                            aria-label="Dong hop chat"
                        >
                            <X className="h-4 w-4"/>
                        </button>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-3 py-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[90%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                                        message.role === "user"
                                            ? "bg-brand-yellow text-brand-dark"
                                            : "bg-white text-slate-700 shadow-sm"
                                    }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {isSending && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                                    Dang soan cau tra loi...
                                </div>
                            </div>
                        )}
                        <div ref={messageEndRef}/>
                    </div>

                    <div className="border-t border-slate-100 bg-white p-3">
                        <div className="mb-2 flex flex-wrap gap-2">
                            {SUGGESTED_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    type="button"
                                    onClick={() => {
                                        void sendQuestion(prompt)
                                    }}
                                    className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                            <input
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                placeholder="Nhap cau hoi..."
                                className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-brand-blue"
                            />
                            <button
                                type="submit"
                                disabled={isSending}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label="Gui cau hoi"
                            >
                                <Send className="h-4 w-4"/>
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-700"
                    aria-label="Mo tro ly AI"
                >
                    <MessageCircle className="h-6 w-6"/>
                </button>
            )}
        </div>
    )
}
