/**
 * 专为儿童打造的语音伴读朗读系统
 * 基于 Web Speech API，零资源消耗，支持中文配音
 */

class SpeechService {
  public enabled: boolean = true;

  /** 朗读儿童引导语音 */
  speak(text: string) {
    if (!this.enabled || !('speechSynthesis' in window)) return;

    // 先停止正在说的内容，防止重叠
    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.95; // 稍慢一些，适合5岁儿童听清
      utterance.pitch = 1.15; // 稍高甜美音调，类似亲切的卡通大姐姐/萌宠

      // 尽量优先寻找中文自然语音
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn'));
      if (zhVoice) {
        utterance.voice = zhVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // 忽略语音合成非致命错误
    }
  }

  /** 停止朗读 */
  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voice = new SpeechService();
