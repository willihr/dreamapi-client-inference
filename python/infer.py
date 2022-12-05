import torch
from torch import autocast
from diffusers import StableDiffusionPipeline, DDIMScheduler

def main(model_path, prompts, negative_prompt="", seed=52362, num_images_per_prompt=4, guidance_scale=7.5, num_inference_steps=50, height=512, width=512):
    scheduler = DDIMScheduler(beta_start=0.00085, beta_end=0.012, beta_schedule="scaled_linear", clip_sample=False, set_alpha_to_one=False)
    if model_path is None:
        pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", revision="fp16", torch_dtype=torch.float16, use_auth_token='YOUR_TOKEN').to("cuda")
    else:
        pipe = StableDiffusionPipeline.from_pretrained(model_path, scheduler=scheduler, safety_checker=None, torch_dtype=torch.float16).to("cuda")

    g_cuda = torch.Generator(device='cuda').manual_seed(seed)

    with autocast("cuda"), torch.inference_mode():
        images = pipe(
            prompts,
            negative_prompt=negative_prompt,
            num_images_per_prompt=num_images_per_prompt,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
            height=height,
            width=width,
            generator=g_cuda
        ).images

    for img in images:
        img.save(f"astronaut_rides_horse.png")
