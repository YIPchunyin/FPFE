"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getToken, getUserId } from "../../../../utils/auth";
import { get, post, uploadImage } from "../../../../utils/request";
const QuillNoSSRWrapper = dynamic(import('react-quill'), { ssr: false });
const EditPost = () => {
  const quillRef = useRef(null);
  const { postId } = useParams();
  const router = useRouter();
  const [coverImage, setCoverImage] = useState(null);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [text, setText] = useState("");
  const [loadingCoverImage, setLoadingCoverImage] = useState(false);
  useEffect(() => {
    const initializeQuill = async () => {
      if (typeof window !== "undefined" && quillRef.current) {
        const Quill = (await import('quill')).default;
        const ImageResize = (await import('quill-image-resize')).default;
        Quill.register('modules/imageResize', ImageResize);

        const quill = new Quill(quillRef.current, {
          theme: 'snow',
          modules: {
            toolbar: [
              [{ 'font': [] }],
              [{ 'size': ['small', false, 'large', 'huge'] }],
              [{ 'header': [1, 2, false] }],
              [{ 'align': [] }],
              ['bold', 'italic', 'underline'],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'color': [] }, { 'background': [] }],
              ['link', 'image'],

            ],
            imageResize: {
              modules: ['Resize', 'DisplaySize', 'Toolbar'],
            },
          },
        });

        quill.on('text-change', () => {
          const html = quill.root.innerHTML;
          setText(html);
        });

        quill.getModule('toolbar').addHandler('image', () => {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
              const range = quill.getSelection();
              if (range) {
                quill.insertText(range.index, '上傳中..', { color: 'red' });
                quill.setSelection(range.index + 5);
              }

              setLoadingCoverImage(true);
              try {
                const uploadResult = await uploadImage(file);
                const imageUrl = uploadResult.imageUrl;
                quill.deleteText(range.index, 5);
                quill.insertEmbed(range.index, 'image', imageUrl);
                quill.setSelection(range.index + 1);
              } catch (error) {
                alert("內容圖片上傳失敗，請重試");
                if (range) {
                  quill.deleteText(range.index, 5);
                  quill.insertText(range.index, '上傳失敗', { color: 'red' });
                }
              } finally {
                setLoadingCoverImage(false);
              }
            }
          };
          input.click();
        });

        quillRef.current = quill;
      }
    };
    if (quillRef.current) {
      initializeQuill();
    }
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const currentUserId = getUserId();
        const response = await get(`/posts/${postId}/edit`);
        console.log(response);
        const { post } = response;
        if (response.permission == false) {
          alert("您沒有修改許可權。");
          router.push(`/postsample/${postId}`);
          return;
        }
        setTitle(post.title);
        setCoverImage(post.img_path);
        setText(post.content);
        if (quillRef.current) {
          quillRef.current.root.innerHTML = post.content;
        }
      } catch (error) {
        console.log("獲取帖子數據失敗，請重試");
        // router.push(`/postsample/${postId}`);
      }
    };

    fetchPost();
  }, []);

  const handleCoverImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoadingCoverImage(true);
      try {
        const uploadResult = await uploadImage(file);
        setCoverImage(uploadResult.imageUrl);
      } catch (error) {
        alert("封面圖片上傳失敗，請重試");
      } finally {
        setLoadingCoverImage(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("請輸入標題");
      return;
    }

    if (!text.trim()) {
      alert("請輸入內容");
      return;
    }

    try {
      setIsSubmitting(true);
      const postData = {
        title,
        content: text,
        img_path: coverImage,
      };
      const response = await post(`/posts/${postId}/edit`, postData, true);
      if (response.status !== 200) {
        throw new Error(response.message || "編輯失敗");
      }
      router.push(`/postsample/${postId}`);
    } catch (error) {
      alert(`編輯失敗: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      alert("請先登錄");
      router.push("/");
    }
  }, []);

  return (
    <div className="flex flex-col items-center p-6 m-auto bg-gray-100" style={{ width: "100%" }}>
      <div className="w-full mb-6 bg-white p-4 rounded shadow" style={{ maxWidth: "60%" }}>
        <h2 className="text-2xl font-semibold mb-4">上傳封面圖片</h2>
        <div
          onClick={() => document.getElementById('cover-image-input').click()}
          className={`relative border-dashed m-auto w-5/6 flex items-center justify-center rounded mb-4 cursor-pointer ${loadingCoverImage ? 'bg-gray-300' : 'bg-white'}`}
          style={{ height: '500px' }}
        >
          {loadingCoverImage ? (
            <span className="text-center">上傳中...</span>
          ) : coverImage ? (
            <img src={coverImage} alt="Uploaded Cover" className="object-contain w-full h-full" style={{ width: '100%', borderRadius: '0.5rem' }} />
          ) : (
            <span className="text-gray-500">点击上傳圖片</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageUpload}
            id="cover-image-input"
            className="hidden"
          />
        </div>
      </div>

      <div className="w-full bg-white p-4 rounded shadow" style={{ maxWidth: "60%" }}>
        <h2 className="text-2xl font-semibold mb-4">輸入内容</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="輸入標題..."
          className="w-full p-3 mb-4 border border-gray-300 rounded"
        />
        <div style={{ maxHeight: '700px', overflow: 'auto', minHeight: '200px' }}>
          <div ref={quillRef} className="mt-2 max-h-screen" style={{ height: 'auto' }} />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-2 mt-4 text-white rounded ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting ? "發佈中..." : "更新帖子"}
        </button>
      </div>
    </div>
  );
};

export default EditPost;
