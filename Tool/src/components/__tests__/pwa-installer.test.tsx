import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { PWAInstaller } from '../pwa-installer'

// 模拟beforeinstallprompt事件
const mockBeforeInstallPrompt = {
  platforms: ['web'],
  userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
  prompt: jest.fn(),
}

describe('PWAInstaller', () => {
  beforeEach(() => {
    // 清除所有模拟
    jest.clearAllMocks()
    
    // 重置window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  it('不显示安装提示当没有beforeinstallprompt事件', () => {
    render(<PWAInstaller />)
    
    expect(screen.queryByText('安装工具集')).not.toBeInTheDocument()
  })

  it('显示安装提示当有beforeinstallprompt事件', async () => {
    // 模拟beforeinstallprompt事件
    const event = new Event('beforeinstallprompt')
    Object.assign(event, mockBeforeInstallPrompt)
    
    render(<PWAInstaller />)
    
    // 触发beforeinstallprompt事件
    await act(async () => {
      window.dispatchEvent(event)
    })
    
    await waitFor(() => {
      expect(screen.getByText('安装工具集')).toBeInTheDocument()
    })
  })

  it('点击安装按钮调用prompt方法', async () => {
    const event = new Event('beforeinstallprompt')
    Object.assign(event, mockBeforeInstallPrompt)
    
    render(<PWAInstaller />)
    
    await act(async () => {
      window.dispatchEvent(event)
    })
    
    await waitFor(() => {
      expect(screen.getByText('安装工具集')).toBeInTheDocument()
    })
    
    const installButton = screen.getByText('安装')
    await act(async () => {
      fireEvent.click(installButton)
    })
    
    expect(mockBeforeInstallPrompt.prompt).toHaveBeenCalled()
  })

  it('点击稍后按钮隐藏安装提示', async () => {
    const event = new Event('beforeinstallprompt')
    Object.assign(event, mockBeforeInstallPrompt)
    
    render(<PWAInstaller />)
    
    await act(async () => {
      window.dispatchEvent(event)
    })
    
    await waitFor(() => {
      expect(screen.getByText('安装工具集')).toBeInTheDocument()
    })
    
    const dismissButton = screen.getByText('稍后')
    await act(async () => {
      fireEvent.click(dismissButton)
    })
    
    await waitFor(() => {
      expect(screen.queryByText('安装工具集')).not.toBeInTheDocument()
    })
  })

  it('当应用已安装时不显示安装提示', () => {
    // 模拟应用已安装
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
    
    render(<PWAInstaller />)
    
    expect(screen.queryByText('安装工具集')).not.toBeInTheDocument()
  })
}) 