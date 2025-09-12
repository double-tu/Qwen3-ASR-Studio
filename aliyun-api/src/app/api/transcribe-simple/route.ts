import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const apiKey = formData.get('apiKey') as string
    const audioFile = formData.get('audio') as File | null
    const audioUrl = formData.get('audioUrl') as string
    const context = formData.get('context') as string

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 400 })
    }

    if (!audioFile && !audioUrl) {
      return NextResponse.json({ error: 'Audio file or URL is required' }, { status: 400 })
    }

    // For this demo, we'll simulate the API response
    // In a real implementation, you would need to handle file uploads properly
    // and make the actual API call to DashScope
    
    console.log('Simulating transcription for:', audioFile ? audioFile.name : audioUrl)
    console.log('Context:', context)
    console.log('API Key provided:', apiKey ? 'Yes' : 'No')

    // Simulate API processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate a transcription result
    const mockResult = {
      text: '这是一个模拟的转录结果。在实际使用中，这里会显示通义千问模型识别的音频内容。',
      language: 'zh',
      confidence: 0.95
    }

    return NextResponse.json(mockResult)

  } catch (error) {
    console.error('Transcription error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Transcription failed',
        details: error.toString(),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}